import Fastify, { FastifyInstance } from 'fastify';

const server: FastifyInstance = Fastify({ logger: true });

server.get('/doctors', async (_request, _reply) => {
  return { doctors: [] };
});

const start = async () => {
  try {
    await server.listen(3000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
