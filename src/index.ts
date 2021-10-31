import Fastify, { FastifyInstance } from 'fastify';
import fs from 'fs';
import * as path from 'path';

const server: FastifyInstance = Fastify({ logger: true });

// Cache data
const cachedData = fs.readFileSync(
  path.resolve(__dirname, './static_input.json')
);
server.get('/doctors', async (_request, _reply) => {
  let rawJsonData = JSON.parse(cachedData.toString());

  // Header starts with 'Ordination' and ends with 'Tel'
  // Entry starts with 'Gruppenpraxis' or 'Praxis'
  let recordHeader = false;
  let header: string[] = [];

  let recordEntry = false;
  let entries: string[] = [];
  let entry = new Set();

  for (let page of rawJsonData.formImage.Pages) {
    for (let text of (page as any)['Texts']) {
      const textValue = decodeURI((text as any)['R'][0]['T'])
        .trim()
        .replace('%26', '&');
      if (textValue === 'Ordination') recordHeader = true;

      if (recordHeader) {
        header.push(textValue);
      }

      if (textValue === 'Tel') recordHeader = false;

      const isFirstWordForEntry =
        textValue === 'Praxis' || textValue === 'Gruppenpraxis';
      if (isFirstWordForEntry) recordEntry = true;

      if (recordEntry) {
        if (entry.size > 0 && isFirstWordForEntry) {
          entries.push(Array.from(entry.values()).join(','));
          entry.clear();
          entry.add(textValue);
        } else {
          entry.add(textValue);
        }
      }
    }
  }

  const finalData = entries.reduce((acc, cur, _idx) => {
    acc.push(Object.fromEntries(parseEntry(cur).entries()));
    return acc;
  }, [] as any[]);
  return { data: finalData };
});

function parseEntry(entry: string) {
  const listOfWords = entry.split(',');
  return mapToHeaders(listOfWords);
}

function mapToHeaders(lst: string[]) {
  const map = new Map<string, string>();
  for (const word of lst) {
    let idx = lst.indexOf(word);
    if (word === 'Praxis' || word === 'Gruppenpraxis')
      map.set('Ordination', lst[idx]!);
    if (word.includes('KW')) {
      map.set('DrNameSurname', lst.slice(1, idx).join(' '));
      map.set('KW', lst[idx]!);
      map.set('Wochentag', lst[idx + 1]!);
      map.set('Datum', lst[idx + 2]!);
      map.set('Uhrzeit', lst[idx + 3]!);
      map.set('Adresse', lst[idx + 4]!);
      map.set('Bezirk', lst[idx + 5]!);
      map.set('Tel', lst.slice(idx + 6, lst.length).join(' '));
      break;
    }
  }
  return map;
}
const start = async () => {
  try {
    await server.listen(3000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
