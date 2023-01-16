import { Request, Response } from 'express';

export const getWelcomeMsg = async (req: Request, res: Response): Promise<void> => {
	res.status(201).json({ message: 'Welcome to Sportika REST API' });
};
