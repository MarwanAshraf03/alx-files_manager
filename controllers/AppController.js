import dbClient from "../utils/db";
import redisClient from "../utils/redis";

export function getStatus(req, res) {
  res.json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
}
export function getStats(req, res) {
  res.json({ users: dbClient.nbUsers(), files: dbClient.nbFiles() });
}
