import { Request, Response } from 'express';
import { AxiosError } from 'axios';

import { db } from '../database';
import { IOrder, IUser } from '../interfaces';
import { Order, Product } from '../models';
import { isValidObjectId } from 'mongoose';

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

	try {
		await db.connect();

		const dbProducts = await Product.find({ _id: { $in: productsIds } });

		const subTotal = orderItems.reduce((prev, current) => {
			const currentPrice = dbProducts.find((product) => product.id === current._id)?.price;
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
		}
	}
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
	const { orderId } = req.params;

	if (!isValidObjectId(orderId)) {
		res.status(400).json({
			message: 'Invalid id.',
		});
		return;
	}

	await db.connect();
	const order = await Order.findById(orderId).select('-__v -createdAt');
	await db.disconnect();

	if (order === null) {
		res.status(400).json({
			message: 'Order not found.',
		});
		return;
	}

	res.status(201).json(order);
};

export const getOrdersByUser = async (req: Request, res: Response): Promise<void> => {
	const { userId } = req.params;

	if (!isValidObjectId(userId)) {
		res.status(400).json({
			message: 'Invalid id.',
		});
		return;
	}

	await db.connect();
	const orders = await Order.find({ user: userId }).select('_id isPaid shippingAddress updatedAt');
	await db.disconnect();

	res.status(201).json(orders);
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
	const { orderId } = req.params;

	try {
		await db.connect();
		const order = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
		if (order === null) {
			res.status(400).json({ message: 'Order does not exist.' });
			return;
		}
		await db.disconnect();
		res.status(200).json(order);
	} catch (error) {
		await db.disconnect();
		res.status(400).json({ message: 'Server Error.' });
	}
};
