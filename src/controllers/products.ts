import { Request, Response } from 'express';

import { db } from '../database';
import { IProduct } from '../interfaces';
import { Product } from '../models';
import { constants } from '../utils';

type Data =
	| {
			message: string;
	  }
	| IProduct[]
	| IProduct;

export const getProducts = async (req: Request, res: Response<Data>): Promise<void> => {
	const { gender = 'all' } = req.query;
	let condition = {};

	if (gender !== 'all' && constants.SHOP_CONSTANTS.validGenders.includes(`${String(gender)}`)) {
		condition = { gender };
	}

	try {
		await db.connect();

		if (gender === 'all') {
			const products = await Product.find({});
			await db.disconnect();

			res.status(200).json(products);

			return;
		}

		const products = await Product.find(condition)
			.select('gender title images price slug inStock description -_id')
			.lean();

		await db.disconnect();
		res.status(200).json(products);
	} catch (error) {
		await db.disconnect();
		res.status(404).json({ message: 'Server Error.' });
	}
};

export const getProductBySlug = async (req: Request, res: Response<Data>): Promise<void> => {
	const { slug } = req.params;

	try {
		await db.connect();

		const product = await Product.findOne({ slug })
			.select('gender title images price slug inStock description sizes _id')
			.lean();

		if (product === null) {
			res.status(404).json({
				message: 'Product not found.',
			});

			await db.disconnect();

			return;
		}

		await db.disconnect();
		res.status(200).json(product);
	} catch (error) {
		await db.disconnect();
		res.status(404).json({
			message: 'Server Error.',
		});
	}
};
