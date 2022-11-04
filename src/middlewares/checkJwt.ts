import { NextFunction, Request, Response } from 'express';
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
	const token = req.header('x-token');

	if (token === undefined) {
		res.status(401).json({
			msg: 'There is no token in the request.',
		});
		return;
	}

	try {
		const userId = await jwt.isValidToken(token);

		// leer el usuario que corresponde al uid
		const user = await User.findById(userId);

		if (user === null) {
			res.status(401).json({
				msg: 'Invalid',
			});
			return;
		}

		// Verificar si el uid tiene estado true
		// if (!usuario.estado) {
		// 	res.status(401).json({
		// 		msg: 'Token no válido - usuario con estado: false',
		// 	});
		// 	return;
		// }

		req.user = user;
		next();
	} catch (error) {
		// console.log(error);
		res.status(401).json({
			msg: 'Invalid token.',
		});
	}
};
