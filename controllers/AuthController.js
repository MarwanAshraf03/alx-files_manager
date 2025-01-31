import dbClient from "../utils/db";
import redisClient from "../utils/redis";
import sha1 from "js-sha1";
import { uuidV4 } from "mongodb/lib/core/utils";

// import base64

export async function getConnect(req, res) {
  const authHeader = atob(req.headers.authorization.split(" ")[1]).split(":");
  if (!authHeader) {
    return res.status(401).send({ error: "Unauthorized" });
  }
  const user = await dbClient.db
    .collection("users")
    .findOne({ email: authHeader[0], password: sha1(authHeader[1]) });
  const token = uuidV4();
  const key = `auth_${token}`;
  redisClient.set(key, user._id.toString(), 86400);
  console.log(authHeader);
  res.status(200).json({ token: token });
}
export function getDisconnect(req, res) {
  const token = req.header("X-Token");
  const id = redisClient.get(`auth_${token}`);
  if (!id) res.status(401).send({ error: "Unauthorized" });
  redisClient.del(`auth_${token}`);
  res.status(204).end();
}
