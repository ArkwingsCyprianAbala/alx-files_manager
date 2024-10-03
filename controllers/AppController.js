import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  // GET /status
  static getStatus(req, res) {
    const status = {
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    };
    res.status(200).json(status);
  }

  // GET /stats
  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    const stats = {
      users,
      files,
    };
    res.status(200).json(stats);
  }
}

export default AppController;
