import MongoClient from "mongodb/lib/mongo_client";

class DBClient {
  constructor() {
    const port = process.env.DB_PORT || "27017";
    const host = process.env.HOST || `mongodb://localhost:${port}`;
    const database = process.env.DB_DATABASE || "files_manager";
    this.client = new MongoClient(host, { useUnifiedTopology: true });
    this.db = null;
    this.connectDB(database);
  }
  async connectDB(database) {
    try {
      await this.client.connect();
      this.db = this.client.db(database);
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  }
  isAlive() {
    // return this.db !== null;
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
