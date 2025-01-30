import express from 'express';
import * as AppController from '../controllers/AppController';
// import UserController from "../controllers/user.js";

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;
