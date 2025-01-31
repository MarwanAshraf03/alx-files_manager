import { Queue } from "bull";
import imageThumbnail from "image-thumbnail";
import fs from "fs";
import dbClient from "./utils/db";

const fileQueue = new Queue("fileQueue");

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error("Missing fileId");
  }
  if (!userId) {
    throw new Error("Missing userId");
  }

  const file = await dbClient.db
    .collection("files")
    .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

  if (!file) {
    throw new Error("File not found");
  }

  const sizes = [100, 250, 500];
  for (const size of sizes) {
    const thumbnail = await imageThumbnail(file.localPath, { width: size });
    const thumbnailPath = `${file.localPath}_${size}`;
    fs.writeFileSync(thumbnailPath, thumbnail);
  }
});
