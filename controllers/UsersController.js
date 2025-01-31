import sha1 from "js-sha1";
import dbClient from "../utils/db";

export async function postNew(req, res) {
  if (!req.body.email) {
    return res.status(400).send({ error: "Missing email" });
  }
  if (!req.body.password) {
    return res.status(400).send({ error: "Missing password" });
  }
  const user = {
    email: req.body.email,
    password: sha1(req.body.password),
  };
  const userExists = await dbClient.db
    .collection("users")
    .findOne({ email: user.email });
  if (userExists) {
    return res.status(400).send({ error: "Already exist" });
  }
  //   dbClient.db.collection("users").insertOne(user);
  const id = dbClient.db.collection("users").findOne({ email: user.email })._id;

  return res.json({ id: id, email: user.email });
}
