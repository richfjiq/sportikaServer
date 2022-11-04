import { Request, Response } from 'express';

import { db } from '../database';
import { IUser } from '../interfaces';
import { Order, Product, User } from '../models';

interface CustomRequest extends Request {
	user?: IUser;
}

type Data =
	| {
			numberOfOrders: number;
			paidOrders: number;
			notPaidOrders: number;
			numberOfClients: number;
			numberOfProducts: number;
			productsWithNoInventory: number;
			lowInventory: number;
	  }
	| { message: string };

export const dashboardInfo = async (req: CustomRequest, res: Response<Data>): Promise<void> => {
	const user = req.user as IUser;

	if (user === undefined) {
		res.status(404).json({ message: 'Unauthorized' });
		return;
	}

	if (user.role === 'client') {
		res.status(404).json({ message: 'Unauthorized' });
		return;
	}

	await db.connect();

	const [
		numberOfOrders,
		paidOrders,
		numberOfClients,
		numberOfProducts,
		productsWithNoInventory,
		lowInventory,
	] = await Promise.all([
		Order.find().count(),
		Order.find({ isPaid: { $eq: true } }).count(),
		User.find().count(),
		Product.find().count(),
		Product.find({
			inStock: { $eq: 0 },
		}).count(),
		Product.find({ inStock: { $lte: 30 } }).count(),
	]);

	await db.disconnect();

	res.status(200).json({
		numberOfOrders,
		paidOrders,
		notPaidOrders: numberOfOrders - paidOrders,
		numberOfClients,
		numberOfProducts,
		productsWithNoInventory,
		lowInventory,
	});
};
