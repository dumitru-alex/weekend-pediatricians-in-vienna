import axios from 'axios';
const PDFParser = require('pdf2json');

const dataInputUrl = 'https://www.aekwien.at/kinder';

export const dataService = {
  getData: async () => {
    const rawData = await axios.get(dataInputUrl);

    const pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataError', (errData: { parserError: any }) =>
      console.error(errData.parserError)
    );
    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      return JSON.stringify(pdfData);
    });

    return pdfParser.parseBuffer(rawData.data);
  },
};

// Old code

// const PDFParser = require('pdf2json');

// const pdfParser = new PDFParser();
// pdfParser.on('pdfParser_dataError', (errData: { parserError: any }) =>
//   server.log.error(errData.parserError)
// );
// pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
//   fs.writeFile('./test.json', JSON.stringify(pdfData), () => {});
// });

// const filePath = path.resolve(__dirname, 'test_file.pdf')
// server.log.info(filePath)
// pdfParser.loadPDF(filePath);
