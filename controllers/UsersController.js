import sha1 from 'js-sha1';
import ObjectId from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export async function postNew(req, res) {
  if (!req.body.email) {
    return res.status(400).send({ error: 'Missing email' });
  }
  if (!req.body.password) {
    return res.status(400).send({ error: 'Missing password' });
  }
  const user = {
    email: req.body.email,
    password: sha1(req.body.password),
  };
  const userExists = await dbClient.db
    .collection('users')
    .findOne({ email: user.email });
  if (userExists) {
    return res.status(400).send({ error: 'Already exist' });
  }
  const result = await dbClient.db.collection('users').insertOne(user);
  const id = result.insertedId;

  return res.json({ id, email: user.email });
}

export async function getMe(req, res) {
  const token = req.header('X-Token');
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const user = await dbClient.db
    .collection('users')
    .findOne({ _id: ObjectId(userId) });
  if (!user) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  return res.json({ id: user._id, email: user.email });
}
