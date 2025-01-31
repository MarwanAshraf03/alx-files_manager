import { ObjectId } from "mongodb";
import redisClient from "../utils/redis";
import dbClient from "../utils/db";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import { Queue } from "bull";

const fileQueue = new Queue("fileQueue");

export async function postUpload(req, res) {
  const token = req.header("X-Token");
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name, type, data, isPublic = false, parentId = "0" } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Missing name" });
  }
  if (!type || !["folder", "file", "image"].includes(type)) {
    return res.status(400).json({ error: "Missing type or invalid type" });
  }
  if (!data && type !== "folder") {
    return res.status(400).json({ error: "Missing data" });
  }

  if (parentId !== "0") {
    const parent = await dbClient.db
      .collection("files")
      .findOne({ _id: ObjectId(parentId) });
    if (!parent) {
      return res.status(400).json({ error: "Parent not found" });
    }
    if (parent.type !== "folder") {
      return res.status(400).json({ error: "Parent is not a folder" });
    }
  }

  const fileDocument = {
    userId: ObjectId(userId),
    name,
    type,
    isPublic,
    parentId: parentId === "0" ? "0" : ObjectId(parentId),
  };

  if (type === "folder") {
    const result = await dbClient.db
      .collection("files")
      .insertOne(fileDocument);
    return res.status(201).json({
      id: result.insertedId,
      ...fileDocument,
    });
  }

  const folderPath = process.env.FOLDER_PATH || "/tmp/files_manager";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filename = uuidv4();
  const localPath = `${folderPath}/${filename}`;
  const fileData = Buffer.from(data, "base64");
  fs.writeFileSync(localPath, fileData);

  fileDocument.localPath = localPath;
  const result = await dbClient.db.collection("files").insertOne(fileDocument);

  if (type === "image") {
    fileQueue.add({ userId, fileId: result.insertedId });
  }

  return res.status(201).json({
    id: result.insertedId,
    ...fileDocument,
  });
}

export async function getShow(req, res) {
  const token = req.header("X-Token");
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const fileId = req.params.id;
  const file = await dbClient.db
    .collection("files")
    .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

  if (!file) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.status(200).json(file);
}

export async function getIndex(req, res) {
  const token = req.header("X-Token");
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { parentId = "0", page = 0 } = req.query;
  const limit = 20;
  const skip = page * limit;

  const files = await dbClient.db
    .collection("files")
    .find({ userId: ObjectId(userId), parentId })
    .skip(skip)
    .limit(limit)
    .toArray();

  return res.status(200).json(files);
}

export async function putPublish(req, res) {
  const token = req.header("X-Token");
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const fileId = req.params.id;
  const file = await dbClient.db
    .collection("files")
    .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

  if (!file) {
    return res.status(404).json({ error: "Not found" });
  }

  await dbClient.db
    .collection("files")
    .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: true } });

  return res.status(200).json({ ...file, isPublic: true });
}

export async function putUnpublish(req, res) {
  const token = req.header("X-Token");
  const userId = await redisClient.get(`auth_${token}`);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const fileId = req.params.id;
  const file = await dbClient.db
    .collection("files")
    .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

  if (!file) {
    return res.status(404).json({ error: "Not found" });
  }

  await dbClient.db
    .collection("files")
    .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: false } });

  return res.status(200).json({ ...file, isPublic: false });
}

export async function getFile(req, res) {
  const fileId = req.params.id;
  const { size } = req.query;
  const file = await dbClient.db
    .collection("files")
    .findOne({ _id: ObjectId(fileId) });

  if (!file) {
    return res.status(404).json({ error: "Not found" });
  }

  if (!file.isPublic) {
    const token = req.header("X-Token");
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId || file.userId.toString() !== userId) {
      return res.status(404).json({ error: "Not found" });
    }
  }

  if (file.type === "folder") {
    return res.status(400).json({ error: "A folder doesn't have content" });
  }

  let filePath = file.localPath;
  if (size && ["100", "250", "500"].includes(size)) {
    filePath = `${file.localPath}_${size}`;
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Not found" });
  }

  const mimeType = mime.lookup(file.name);
  res.setHeader("Content-Type", mimeType);
  return res.sendFile(filePath);
}
