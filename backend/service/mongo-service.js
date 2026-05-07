import { MongoClient } from 'mongodb';
import 'dotenv/config';

let client = null;
let db = null;

export async function getDb() {
  if (db) return db;

  const uri = process.env.DATABASE_URI;
  if (!uri) throw new Error('DATABASE_URI is not defined');

  client = new MongoClient(uri);
  await client.connect();

  // Extract database name from URI path (e.g. /open-sprint-retro)
  const dbName = new URL(uri).pathname.replace('/', '').split('?')[0];
  db = client.db(dbName);

  return db;
}
