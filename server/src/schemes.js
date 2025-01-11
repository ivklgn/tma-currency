export const liveQueryStringSchema = {
  type: 'object',
  properties: {
    source: { type: 'string' },
    currencies: { type: 'string' },
  },
};

export const timeframeQueryStringSchema = {
  type: 'object',
  properties: {
    start_date: { type: 'string' },
    end_date: { type: 'string' },
    source: { type: 'string' },
    currencies: { type: 'string' },
  },
  required: ['start_date', 'end_date'],
};
