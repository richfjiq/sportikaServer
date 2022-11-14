import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { db } from '../database';
import { User } from '../models';
import { jwt, validations } from '../utils';
import { IUser } from '../interfaces';

type Data =
	| {
			message: string;
	  }
	| {
			token: string;
			user: {
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
		throw Error('Email / Password not valid - Email');
	}

	if (!bcrypt.compareSync(password, String(user.password))) {
		res.status(400).json({ message: 'Email / Password not valid - Password' });
		throw Error('Email / Password not valid - Password');
	}

	const { role, name, _id } = user;
	const token = jwt.signToken(_id, email);

	res.status(200).json({
		token,
		user: {
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
			email,
			role,
			name,
		},
	});
};

export const checkJWT = async (req: Request, res: Response<Data>): Promise<void> => {
	// console.log(req.headers.cookie);

	// const { token = '' } = req.cookies;
	const token = req.headers.cookie ?? '';

	let userId = '';

	try {
		userId = await jwt.isValidToken(token);
	} catch (error) {
		res.status(401).json({
			message: 'Auth token is not valid.',
		});
		return;
	}

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
			email,
			role,
			name,
		},
	});
};
