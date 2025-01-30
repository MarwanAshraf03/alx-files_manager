import MongoClient from "mongodb/lib/mongo_client";

class DBClient {
  constructor() {
    const port = process.env.DB_PORT ?? "27017";
    const host = process.env.HOST ?? `mongodb://localhost:${port}`;
    const database = process.env.DB_DATABASE ?? "files_manager";
    this.db = null;
    MongoClient.connect(host, { useUnifiedTopology: true }, (err, client) => {
      if (err) console.log(err);
      this.db = client.db(database);
    });
  }
  isAlive() {
    return this.db !== null;
  }
  async nbUsers() {
    return this.db.collection("users").countDocuments();
  }
  async nbFiles() {
    return this.db.collection("files").countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
