export default function postNew(req, res) {
  if (!req.body.email) {
    return res.status(400).send({ error: "Missing email" });
  }
  if (!req.body.password) {
    return res.status(400).send({ error: "Missing password" });
  }
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  const userExists = dbClient.db
    .collection("users")
    .findOne({ email: user.email });
  if (userExists) {
    return res.status(400).send({ error: "Already exist" });
  }
  dbClient.db.collection("users").insertOne(user);
}
