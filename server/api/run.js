import { app } from './app.js';

const port = normalizePort(process.env.PORT || '8080');

(async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
    onListening();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();

app.addHook('onError', async (request, reply, error) => {
  onError(error);
});

app.addHook('onReady', async () => {
  console.log('app is ready');
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
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      console.error('Unexpected error: ', error);
      process.exit(1);
  }
}

function onListening() {
  const address = app.server.address();
  console.log(`Server listening on port ${address.port} ??`);
}
