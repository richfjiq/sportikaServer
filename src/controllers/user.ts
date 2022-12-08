import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { db } from '../database';
import { User } from '../models';
import { jwt, validations } from '../utils';
import { IUser, IUserUpdate } from '../interfaces';

type Data =
	| {
			message: string;
	  }
	| {
			token: string;
			user: {
				_id: string;
				email: string;
				name: string;
				role: string;
			};
	  };

export const loginUser = async (req: Request, res: Response<Data>): Promise<void> => {
	const { email = '', password = '' } = req.body;

	await db.connect();
	const user: IUser | null = await User.findOne({ email });
	await db.disconnect();

	if (user === null) {
		res.status(400).json({ message: 'Email / Password not valid - Email' });
		return;
	}

	if (!bcrypt.compareSync(password, String(user.password))) {
		res.status(400).json({ message: 'Email / Password not valid - Password' });
		return;
	}

	const { role, name, _id } = user;
	const token = jwt.signToken(_id, email);

	res.status(200).json({
		token,
		user: {
			_id,
			email,
			role,
			name,
		},
	});
};

export const registerUser = async (req: Request, res: Response<Data>): Promise<void> => {
	const {
		email = '',
		password = '',
		name = '',
	} = req.body as { email: string; password: string; name: string };

	if (password.length < 6) {
		res.status(400).json({
			message: 'Password must have at least 6 characters',
		});
		return;
	}

	if (name.length < 2) {
		res.status(400).json({
			message: 'Name must have at least 2 characters',
		});
		return;
	}

	if (!validations.isValidEmail(email)) {
		res.status(400).json({
			message: 'Email is not valid',
		});
		return;
	}

	await db.connect();
	const user = await User.findOne({ email });

	if (user !== null) {
		res.status(400).json({
			message: 'Email already exists.',
		});
		await db.disconnect();
		return;
	}

	const newUser = new User({
		email: email.toLocaleLowerCase(),
		password: bcrypt.hashSync(password),
		role: 'client',
		name,
	});

	try {
		await newUser.save({ validateBeforeSave: true });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log(error);
		res.status(500).json({
			message: 'Server error',
		});
		return;
	}

	const { _id, role } = newUser;
	const token = jwt.signToken(_id, email);

	res.status(200).json({
		token,
		user: {
			_id,
			email,
			role,
			name,
		},
	});
};

export const updateUser = async (req: Request, res: Response<Data>): Promise<void> => {
	const { userId } = req.params;
	const { name, email, currentPassword, newPassword } = req.body as IUserUpdate;

	try {
		await db.connect();

		const user = await User.findById(userId);

		if (user === null) {
			res.status(400).json({ message: 'There is no user with this id.' });
			return;
		}

		if (!bcrypt.compareSync(currentPassword, user.password as string)) {
			res.status(400).json({ message: 'Current password is incorrect.' });
			return;
		}

		await user.update({
			name,
			email,
			password: bcrypt.hashSync(newPassword),
		});

		await db.disconnect();

		res.status(200).json({
			token: jwt.signToken(user._id, email),
			user: {
				_id: user._id,
				email,
				role: user.role,
				name,
			},
		});
	} catch (error) {
		await db.disconnect();
		res.status(401).json({
			message: 'Auth token is not valid.',
		});
	}
};

export const checkJWT = async (req: Request, res: Response<Data>): Promise<void> => {
	const token = req.header('x-token') ?? '';

	let userId = '';

	try {
		userId = await jwt.isValidToken(token);

		await db.connect();
		const user = await User.findById(userId).lean();
		await db.disconnect();

		if (user === null) {
			res.status(400).json({ message: 'There is no user with this id.' });
			return;
		}

		const { _id, email, role, name } = user;

		res.status(200).json({
			token: jwt.signToken(_id, email),
			user: {
				_id,
				email,
				role,
				name,
			},
		});
	} catch (error) {
		res.status(401).json({
			message: 'Auth token is not valid.',
		});
	}
};
