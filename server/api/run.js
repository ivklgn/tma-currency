import { app } from './app.js';
import { serverError } from './errors.js';

const port = normalizePort(process.env.PORT || '8080');

(async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
    onListening();
  } catch (err) {
    serverError('RunError', 'Failed to start server', { originalError: err }).emit();
    process.exit(1);
  }
})();

app.addHook('onError', async (request, reply, error) => {
  onError(error);
});

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      serverError('RunError', bind + ' requires elevated privileges', {
        originalError: error,
      }).emit();
      process.exit(1);
      break;
    case 'EADDRINUSE':
      serverError('RunError', bind + ' is already in use', { originalError: error }).emit();
      process.exit(1);
      break;
    default:
      serverError('UnexpectedError', 'Unknown error', { originalError: error }).emit();
      process.exit(1);
  }
}

function onListening() {
  const address = app.server.address();
  console.log(`Server listening on port ${address.port} ??`);
}
