import express from 'express';
import { config } from 'dotenv';
config();
import authRouter from './routes/auth';
import mongoose from 'mongoose';


if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URIが環境変数に設定されていません");
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});