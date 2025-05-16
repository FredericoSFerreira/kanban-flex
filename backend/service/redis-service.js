import {createClient} from 'redis';

let client;

export async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URI
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    client.on('ready', () => console.log('Redis Client Connect Success'));

    await client.connect();
  }

  return client;
}

