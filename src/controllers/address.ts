import { Request, Response } from 'express';

import { db } from '../database';
import { IAddress } from '../interfaces';
import Address from '../models/Address';

export const createAddress = async (req: Request, res: Response): Promise<void> => {
	const { user, firstName, lastName, address, zip, city, state, country, code, phone } =
		req.body as IAddress;

	try {
		await db.connect();
		const userAddress = new Address({
			user,
			firstName,
			lastName,
			address,
			zip,
			city,
			state,
			country,
			code,
			phone,
		});

		await userAddress.save();
		res.status(201).json(userAddress);
		await db.disconnect();
	} catch (error) {
		await db.disconnect();
		res.status(400).json({ message: 'Server error.' });
	}
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
	const { user, firstName, lastName, address, zip, city, state, country, code, phone } =
		req.body as IAddress;

	try {
		await db.connect();
		const obj = await Address.find<IAddress>({ user });
		const userAddress = await Address.findByIdAndUpdate(
			obj[0]._id,
			{
				user,
				firstName,
				lastName,
				address,
				zip,
				city,
				state,
				country,
				code,
				phone,
			},
			{ new: true },
		);
		res.status(201).json(userAddress);
		await db.disconnect();
	} catch (error) {
		await db.disconnect();
		res.status(400).json({ message: 'Server error.' });
	}
};

export const getAddressByUser = async (req: Request, res: Response): Promise<void> => {
	const { id } = req.params;

	try {
		await db.connect();
		const userAddress = await Address.find({ user: id }).select('-__v');
		res.status(201).json(userAddress);
		await db.disconnect();
	} catch (error) {
		await db.disconnect();
		res.status(400).json({ message: 'Server error.' });
	}
};
