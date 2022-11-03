import { Request, Response } from 'express';

import { db } from '../database';
import { IProduct } from '../interfaces';
import { Product } from '../models';

type Data =
	| {
			message: string;
	  }
	| IProduct[];

export const searchProducts = async (req: Request, res: Response<Data>): Promise<void> => {
	let { q = '' } = req.query;

	if (q.length === 0) {
		res.status(400).json({
			message: 'You must specify the search query',
		});

		return;
	}

	q = String(q).toLowerCase();
	// q = q.toString().toLowerCase();

	await db.connect();

	const products = await Product.find({
		$text: { $search: q },
	})
		.select('title images price inStock slug -_id')
		.lean();

	await db.disconnect();

	res.status(200).json(products);
};
