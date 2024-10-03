import crypto from 'crypto';
import dbClient from '../utils/db';

/**
 * Class to handle user-related actions
 */
class UsersController {
  /**
   * Handles the creation of a new user
   * @param {object} req - Request object from Express
   * @param {object} res - Response object from Express
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if user already exists
    const existingUser = await dbClient.getUser({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const sha1Password = crypto.createHash('sha1').update(password).digest('hex');

    // Insert new user into the 'users' collection
    const newUser = {
      email,
      password: sha1Password,
    };

    try {
      const result = await dbClient.db.collection('users').insertOne(newUser);
      return res.status(201).json({
        id: result.insertedId,
        email: newUser.email,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error creating user' });
    }
  }
}

export default UsersController;
