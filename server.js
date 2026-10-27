import { createApp } from './src/server.js';

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535');
}

const server = createApp();

server.on('error', (error) => {
  console.error('Could not start the server:', error.message);
  process.exitCode = 1;
});

server.listen(port, () => {
  console.log(`Hamster Gym: http://localhost:${server.address().port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close());
}
