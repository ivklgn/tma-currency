import Fastify from 'fastify';
import { fetchLiveCurrencies, fetchTimeframe } from './api.js';
import cors from '@fastify/cors';
import { validate } from '@telegram-apps/init-data-node';
import { serverError } from './errors.js';

export const app = Fastify({
  logger: true,
});

async function validateInitData(request, reply) {
  const { init_data } = request.headers;

  if (!init_data) {
    return reply.status(400).send({ error: 'Missing initData' });
  }

  try {
    validate(init_data, process.env.BOT_TOKEN, { expiresIn: 0 });
  } catch (e) {
    return reply.status(403).send({ error: 'Invalid or expired initData' });
  }
}

app.register(cors, {
  origin: ['https://localhost:5173', 'https://tma-exchange-rate.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

// https://apilayer.com/marketplace/exchangerates_data-api#rate-limits
app.addHook('preHandler', validateInitData);

app.get(
  '/live',
  {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          currencies: { type: 'string' },
        },
      },
    },
  },
  async (request, reply) => {
    const { source, currencies } = request.query;
    app.log.info({ init: request.headers?.init_data });

    try {
      const response = await fetchLiveCurrencies({ source, currencies });

      return reply.send(response);
    } catch (error) {
      serverError('DataHandlingError', 'Failed to fetch data', { originalError: error }).emit();
      return reply.status(500).send({ error: 'Failed to fetch data' });
    }
  }
);

app.get(
  '/timeframe',
  {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          source: { type: 'string' },
          currencies: { type: 'string' },
        },
        required: ['start_date', 'end_date'],
      },
    },
  },
  async (request, reply) => {
    const { start_date, end_date, source, currencies } = request.query;

    try {
      const response = await fetchTimeframe({ start_date, end_date, currencies, source });

      return reply.send(response);
    } catch (error) {
      serverError('DataHandlingError', 'Failed to fetch data', { originalError: error }).emit();
      return reply.status(500).send({ error: 'Failed to fetch data' });
    }
  }
);
