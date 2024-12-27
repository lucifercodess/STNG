import express from 'express';
import { decoded } from '../middlewares/protect.middleware.js';
import { getResult } from '../controllers/gemini.controller.js';

const router = express.Router();

router.get('/get-result',getResult)

export default router;