import { ObjectId } from "mongodb";
import redisClient from "../utils/redis";
import dbClient from "../utils/db";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

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
  const localPath = `folderPath/${filename}`;
  const fileData = Buffer.from(data, "base64");
  fs.writeFileSync(localPath, fileData);
  fileDocument.localPath = localPath;
  const result = await dbClient.db.collection("files").insertOne(fileDocument);
  return res.status(201).json({
    id: result.insertedId,
    ...fileDocument,
  });
}
