import express from "express";
import * as AppController from "../controllers/AppController";
import * as UsersController from "../controllers/UsersController";
// import UserController from "../controllers/user.js";

const router = express.Router();

router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);

// router.post("/users", UsersController.postNew);

export default router;
