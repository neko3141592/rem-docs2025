import express, {Request, Response} from 'express';

const router = express.Router();

router.post('/login', (req: Request, res: Response) => {

    res.status(200).json({ message: 'Login successful' });
});

export default router;