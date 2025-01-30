import redis from "redis";

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on("error", (error) => {
      console.error(
        `Redis client not connected to the server: ${error.message}`
      );
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const gett = promisfy(this.client.get).bind(this.client);
    return await gett(key);
  }

  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
