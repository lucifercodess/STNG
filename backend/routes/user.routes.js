import express from 'express';
import { getAllUsers, getUser, login, logout, register } from '../controllers/user.controller.js';
import { decoded } from '../middlewares/protect.middleware.js';

const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/logout',decoded,logout);
router.get('/get-user',decoded,getUser);
router.get('/get-all',decoded,getAllUsers);

export default router;