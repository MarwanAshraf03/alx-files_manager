import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export function status() {
  return { redis: redisClient.isAlive, db: dbClient.isAlive };
}
export function stats() {
  return { users: dbClient.nbUsers, files: dbClient.nbFiles };
}
