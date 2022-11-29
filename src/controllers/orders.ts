import { Request, Response } from 'express';
import { AxiosError } from 'axios';

import { db } from '../database';
import { IOrder, IUser } from '../interfaces';
import { Order, Product } from '../models';

interface CustomRequest extends Request {
	user?: IUser;
}

type Data =
	| {
			message: string;
	  }
	| IOrder;

export const createOrder = async (req: CustomRequest, res: Response<Data>): Promise<void> => {
	const { orderItems, total } = req.body as IOrder;
	const user = req.user as IUser;

	const productsIds = orderItems.map((product) => product._id);
	await db.connect();

	const dbProducts = await Product.find({ _id: { $in: productsIds } });

	try {
		const subTotal = orderItems.reduce((prev, current) => {
			const currentPrice = dbProducts.find(
				// data from db use product.id not product._id
				(product) => product.id === current._id,
			)?.price;
			if (currentPrice === undefined) {
				throw new Error('Verify the cart, product does not exist.');
			}

			return currentPrice * current.quantity + prev;
		}, 0);
		const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? 0);
		const backendTotal = subTotal * (taxRate + 1);

		if (total !== backendTotal) {
			res.status(400).json({ message: 'Total does not match.' });
			return;
		}

		const userId = user._id;
		const newOrder = new Order({
			...req.body,
			isPaid: false,
			user: userId,
		});
		newOrder.total = Math.round(newOrder.total * 100) / 100;

		await newOrder.save();
		await db.disconnect();

		res.status(201).json(newOrder);
	} catch (error) {
		await db.disconnect();

		if (error instanceof AxiosError) {
			res.status(400).json(error.response?.data.message);
			return;
		}

		if (error instanceof Error) {
			res.status(400).json({
				message: error.message,
			});
			return;
		}
	}
	await db.disconnect();
	res.status(201).json(req.body);
};
