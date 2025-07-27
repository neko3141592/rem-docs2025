import express, {Request, Response} from 'express';
import  User  from '../models/User'; 
import jwt from 'jsonwebtoken';
import config from '../config';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    const {username, password, email} = req.body;
    const exitingUsers = await User.findOne({ username });

    if (exitingUsers) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password:hashedPassword, email });
    await newUser.save();


    const payload = { id: newUser._id, username: newUser.username };


    const jwtOptions = {
        expiresIn: '1h' as const,
        algorithm: 'HS256' as const 
    };

    if (!config.jwt.secret) {
        return res.status(500).json({ message: 'JWT secret is not configured' });
    }

    const token = jwt.sign(payload, config.jwt.secret, jwtOptions);
    res.status(201).json({ token });
});

router.post('/login', (req: Request, res: Response) => {
    const {username, password} = req.body;
    res.status(200).json({ message: 'Login successful' });
});

export default router;