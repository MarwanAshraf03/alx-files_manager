import dbClient from "../utils/db";
// import base64

function connect(req, res) {
  const authHeader = req.headers.authorization;
  const user = dbClient.db.collection("users").findOne({ email: user.email });
  if (!authHeader) {
    return res.status(401).send({ error: "Unauthorized" });
  }
}
