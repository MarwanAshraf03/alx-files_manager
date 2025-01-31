import express from 'express';
import * as AppController from '../controllers/AppController';
import * as UsersController from '../controllers/UsersController';
import * as AuthController from '../controllers/AuthController';
import * as FilesController from '../controllers/FilesController';

const router = express.Router();

// AppController routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// UsersController routes
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// AuthController routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// FilesController routes
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);

export default router;
