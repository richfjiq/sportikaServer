import { Request, Response } from 'express';
import path from 'path';

export const getHomePage = async (req: Request, res: Response): Promise<void> => {
	const homePage = path.join(__dirname, '../public/index.html');
	res.status(200).sendFile(homePage);
};
