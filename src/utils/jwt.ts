import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const signToken = (_id: string, email: string): string => {
	if (process.env.JWT_SECRET_SEED === undefined) {
		throw new Error('There is no JWT seed - Check environment variables');
	}

	return jwt.sign({ _id, email }, process.env.JWT_SECRET_SEED, {
		expiresIn: '30d',
	});
};

export const isValidToken = async (token: string): Promise<string> => {
	if (process.env.JWT_SECRET_SEED === undefined) {
		throw new Error('There is no JWT seed - Check environment variables');
	}

	if (token.length <= 10) {
		return await Promise.reject(new Error('JWT is not valid.'));
	}

	return await new Promise((resolve, reject) => {
		try {
			jwt.verify(token, process.env.JWT_SECRET_SEED ?? '', (err, payload) => {
				if (err !== null) return reject(new Error('JWT is not valid.'));

				const { _id } = payload as { _id: string };

				resolve(_id);
			});
		} catch (error) {
			reject(new Error('JWT is not valid.'));
		}
	});
};
