import redis from 'redis';
import { promisify } from 'util';

/**
 * Class for performing operations with Redis service
 */
class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.getAsync = promisify(this.client.get).bind(this.client);

    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error.message}`);
    });

    this.client.on('connect', () => {
      console.log('Redis client connected to the server');
    });
  }

  /**
   * Checks if connection to Redis is Alive
   * @return {boolean} true if connection alive or false if not
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Gets value corresponding to key in redis
   * @param {string} key - Key to search for in redis
   * @return {string}  Value of key
   */
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  /**
   * Creates a new key in redis with a specific TTL
   * @param {string} key - Key to be saved in redis
   * @param {string} value - Value to be assigned to key
   * @param {number} duration - TTL of key (in seconds)
   * @return {undefined}
   */
  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  /**
   * Deletes key in redis service
   * @param {string} key - Key to be deleted
   * @return {undefined}
   */
  async del(key) {
    this.client.del(key);
  }

  /**
   * Closes the Redis client connection
   */
  // quit() {
  //   this.client.quit();
  // }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();

export default redisClient;
