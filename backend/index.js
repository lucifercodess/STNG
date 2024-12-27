import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoute from './routes/user.routes.js'
import projectRoute from './routes/project.routes.js'
import geminiRoute from './routes/gemini.routes.js'

dotenv.config();


const app = express();

app.use(cors({
  credentials: true,
  origin: 'http://localhost:5174',
}))
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth',userRoute);
app.use('/api/user',projectRoute);
app.use('/api/gemini',geminiRoute);

export default app;