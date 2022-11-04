import { NextFunction, Request, Response } from 'express';
import { IUser } from '../interfaces';

interface CustomRequest extends Request {
	user?: IUser;
}

export const isAdminRole = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const user = req.user as IUser;

	if (user === undefined) {
		res.status(404).json({ message: 'Unauthorized' });
		return;
	}

	if (user.role === 'client') {
		res.status(404).json({ message: 'Unauthorized' });
		return;
	}

	next();
};
