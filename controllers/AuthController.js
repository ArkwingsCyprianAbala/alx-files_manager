import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * Handles user authentication (login and logout)
 */
class AuthController {
  /**
   * Sign in a user with Basic Auth and returns a token
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1];
    if (!base64Credentials) return res.status(401).json({ error: 'Unauthorized' });

    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) return res.status(401).json({ error: 'Unauthorized' });

    const hashedPassword = sha1(password);
    const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 24 * 60 * 60); // Store token for 24 hours

    return res.status(200).json({ token });
  }

  /**
   * Sign out a user by removing the token from Redis
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await redisClient.del(key); // Remove the token from Redis
    return res.status(204).send(); // No content response
  }
}

export default AuthController;
