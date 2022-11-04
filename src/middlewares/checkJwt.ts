import { NextFunction, Request, Response } from 'express';

import { db } from '../database';
import { IUser } from '../interfaces';
import { User } from '../models';
import { jwt } from '../utils';

interface CustomRequest extends Request {
	user?: IUser;
}

export const checkJWT = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	const token = (req.headers['x-token'] as string) ?? undefined;

	if (token === undefined) {
		res.status(401).json({
			msg: 'There is no token in the request.',
		});
		return;
	}

	try {
		const userId = await jwt.isValidToken(token);

		await db.connect();

		const user = await User.findById(userId);

		if (user === null) {
			res.status(401).json({
				msg: 'Invalid',
			});
			return;
		}

		req.user = user;
		await db.disconnect();
		next();
	} catch (error) {
		res.status(401).json({
			msg: 'Invalid token.',
		});
		await db.disconnect();
	}
};
