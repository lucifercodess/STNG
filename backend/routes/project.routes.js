import express from 'express';
import { addUser, createProject, getProjectDetail, getProjectsForSpecificUser } from '../controllers/project.controller.js';
import { decoded } from '../middlewares/protect.middleware.js';


const router = express.Router();

router.post('/create-project',decoded,createProject);
router.get('/all',decoded,getProjectsForSpecificUser);
router.put('/add-user/:id',decoded,addUser);
router.get('/get-projects/:id',decoded,getProjectDetail);

export default router;