import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import Handlebars from 'handlebars';
import path from 'path';
import { readFileSync } from 'fs';
import { OAuth2Client } from 'google-auth-library';

import { db } from '../database';
import { User } from '../models';
import { jwt, validations } from '../utils';
import { IUser, IUserDataUpdate, IUserPasswordUpdate } from '../interfaces';

const googleId = process.env.GOOGLE_CLIENT_ID;
sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');
const client = new OAuth2Client(googleId);

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
				type?: string;
			};
	  };

const sendWelcomeMail = async (msg: MailDataRequired): Promise<void> => {
	try {
		await sgMail.send(msg);
		// eslint-disable-next-line no-console
		console.log('Welcome email, sent successfully :)');
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log({ error });
	}
};

export const loginUser = async (req: Request, res: Response<Data>): Promise<void> => {
	const { email = '', password = '' } = req.body;

	const emailLowerCase = email.toLowerCase();

	try {
		await db.connect();
		const user: IUser | null = await User.findOne({ email: emailLowerCase });
		await db.disconnect();

		if (user === null) {
			res.status(400).json({ message: 'Email / Password not valid - Email' });
			return;
		}

		if (!bcrypt.compareSync(password, String(user.password))) {
			res.status(400).json({ message: 'Email / Password not valid - Password' });
			return;
		}

		const { role, name, _id, type } = user;
		const token = jwt.signToken(_id, emailLowerCase);

		res.status(200).json({
			token,
			user: {
				_id,
				email: emailLowerCase,
				role,
				name,
				type,
			},
		});
	} catch (error) {
		await db.disconnect();
		// eslint-disable-next-line no-console
		console.log('error loginUser =======', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
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

	const pathHandlebars = path.join(__dirname, '../views/welcome.handlebars');
	const fileHandlebars = readFileSync(pathHandlebars, 'utf-8');

	const template = Handlebars.compile(fileHandlebars);

	try {
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
			type: 'credentials',
		});

		await newUser.save({ validateBeforeSave: true });

		const { _id, role, type } = newUser;
		const token = jwt.signToken(_id, email);

		await db.disconnect();

		const emailData = {
			to: newUser.email,
			from: 'rfjiq1986@gmail.com',
			subject: 'Congratulations! You are made it!',
			html: template({ name }),
		};

		await sendWelcomeMail(emailData);

		res.status(200).json({
			token,
			user: {
				_id,
				email,
				role,
				name,
				type,
			},
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log('register error +++++++', error);
		await db.disconnect();

		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const updateUserAccount = async (req: Request, res: Response<Data>): Promise<void> => {
	const { userId } = req.params;
	const { name, email, currentPassword } = req.body as IUserDataUpdate;

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
		});

		await db.disconnect();

		res.status(200).json({
			token: jwt.signToken(user._id, email),
			user: {
				_id: user._id,
				email,
				role: user.role,
				name,
				type: user?.type,
			},
		});
	} catch (error) {
		await db.disconnect();
		res.status(500).json({
			message: 'Internal Server Error.',
		});
	}
};

export const updateUserPassword = async (req: Request, res: Response<Data>): Promise<void> => {
	const { userId } = req.params;
	const { currentPassword, newPassword } = req.body as IUserPasswordUpdate;

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
			password: bcrypt.hashSync(newPassword),
		});

		await db.disconnect();

		res.status(200).json({
			token: jwt.signToken(user._id, user.email),
			user: {
				_id: user._id,
				email: user.email,
				role: user.role,
				name: user.name,
				type: user?.type,
			},
		});
	} catch (error) {
		await db.disconnect();
		res.status(500).json({
			message: 'Internal Server Error.',
		});
	}
};

export const googleAuth = async (req: Request, res: Response<Data>): Promise<void> => {
	try {
		const tokenParams = req.params.token;

		const ticket = await client.verifyIdToken({
			idToken: tokenParams,
			audience: googleId,
		});
		const userData = ticket.getPayload();

		if (!validations.isValidEmail(userData?.email as string)) {
			res.status(401).json({
				message: 'Auth token is not valid.',
			});
			return;
		}

		const pathHandlebars = path.join(__dirname, '../views/welcome.handlebars');
		const fileHandlebars = readFileSync(pathHandlebars, 'utf-8');

		const template = Handlebars.compile(fileHandlebars);

		await db.connect();
		const user = await User.findOne({ email: userData?.email });

		if (user !== null) {
			const token = jwt.signToken(user._id, userData?.email as string);
			await db.disconnect();

			res.status(200).json({
				token,
				user: {
					_id: user._id,
					email: user.email,
					role: user.role,
					name: user.name,
					type: user.type,
				},
			});

			return;
		}

		const newUser = new User({
			email: (userData?.email as string).toLocaleLowerCase(),
			password: 'google_oAuth',
			type: 'googleAuthentication',
			role: 'client',
			name: userData?.name,
		});
		await newUser.save({ validateBeforeSave: true });

		const { _id, role, type, email, name } = newUser;
		const token = jwt.signToken(_id, email);
		await db.disconnect();

		const emailData = {
			to: newUser.email,
			from: 'rfjiq1986@gmail.com',
			subject: 'Congratulations! You are made it!',
			html: template({ name }),
		};

		await sendWelcomeMail(emailData);

		res.status(200).json({
			token,
			user: {
				_id,
				email,
				role,
				name,
				type,
			},
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log('register error +++++++', error);
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

		const { _id, email, role, name, type } = user;

		res.status(200).json({
			token: jwt.signToken(_id, email),
			user: {
				_id,
				email,
				role,
				name,
				type,
			},
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log('checkJWT error ------', error);
		await db.disconnect();
		res.status(401).json({
			message: 'Auth token is not valid.',
		});
	}
};
