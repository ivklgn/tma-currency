import Fastify from 'fastify';
import { liveQueryStringSchema, timeframeQueryStringSchema } from './src/schemes.js';
import { fetchLiveCurrencies, fetchTimeframe } from './src/api.js';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: ['https://localhost:5173', 'https://tma-exchange-rate.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

fastify.get('/', async (request, reply) => {
  return reply.send({ hello: 'exchange rate proxy' });
});

fastify.get('/live', { schema: { querystring: liveQueryStringSchema } }, async (request, reply) => {
  const { source, currencies } = request.query;

  try {
    const response = await fetchLiveCurrencies({ source, currencies });

    return reply.send(response);
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch data' });
  }
});

fastify.get(
  '/timeframe',
  { schema: { querystring: timeframeQueryStringSchema } },
  async (request, reply) => {
    const { start_date, end_date, source, currencies } = request.query;

    try {
      const response = await fetchTimeframe({ start_date, end_date, currencies, source });

      return reply.send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch data' });
    }
  }
);

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
