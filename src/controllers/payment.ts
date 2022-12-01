import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export const getConfig = async (req: Request, res: Response): Promise<void> => {
	const publishableKey = process.env.STRIPE_PUBLISHABLE_SECRET_KEY;
	const config = {
		publishableKey,
	};

	res.status(201).json(config);
};
