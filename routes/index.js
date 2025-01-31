import express from "express";
import * as AppController from "../controllers/AppController";
import * as UserController from "../controllers/UsersController";
import * as AuthController from "../controllers/AuthController";
import * as FilesController from "../controllers/FilesController";
// import UserController from "../controllers/user.js";

const router = express.Router();

router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);

router.post("/users", UserController.postNew);
router.get("/users/me", UserController.getMe);

router.get("/connect", AuthController.getConnect);
router.get("/disconnect", AuthController.getDisconnect);

router.post("/files", FilesController.postUpload);

export default router;
