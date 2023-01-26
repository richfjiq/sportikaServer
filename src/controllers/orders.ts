import { Request, Response } from 'express';
import { AxiosError } from 'axios';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import Handlebars from 'handlebars';
import path from 'path';
import { readFileSync } from 'fs';

import { db } from '../database';
import { IOrder, IUser } from '../interfaces';
import { Order, Product, User } from '../models';
import { isValidObjectId } from 'mongoose';
import { currency } from '../utils';

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');

interface CustomRequest extends Request {
	user?: IUser;
}

type Data =
	| {
			message: string;
	  }
	| IOrder;

const sendOrderConfirmedMail = async (
	type: 'confirm' | 'paid',
	msg: MailDataRequired,
): Promise<void> => {
	try {
		await sgMail.send(msg);
		if (type === 'confirm') {
			// eslint-disable-next-line no-console
			console.log('Order Confirmed email, sent successfully!');
		}
		// eslint-disable-next-line no-console
		console.log('Order Has Been Paid, sent successfully!');
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log({ error });
	}
};

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

		const pathHandlebars = path.join(__dirname, '../views/orderConfirmed.handlebars');
		const fileHandlebars = readFileSync(pathHandlebars, 'utf-8');

		const template = Handlebars.compile(fileHandlebars);

		const items = newOrder.orderItems.map((item) => ({
			image: item.image,
			price: currency.currencyFormat(item.price),
			title: item.title,
			size: item.size,
			quantity: item.quantity,
		}));

		const emailData = {
			to: user.email,
			from: 'rfjiq1986@gmail.com',
			subject: 'Your order has been confirmed!',
			html: template({
				order: newOrder._id,
				items,
				name: `${newOrder.shippingAddress.firstName} ${newOrder.shippingAddress.lastName}`,
				address: newOrder.shippingAddress.address,
				city: `${newOrder.shippingAddress.city}, ${newOrder.shippingAddress?.state as string}, ${
					newOrder.shippingAddress.zip
				}`,
				country: newOrder.shippingAddress.country,
				phoneNumber: `${newOrder.shippingAddress.code} ${newOrder.shippingAddress.phone}`,
				totalItems: newOrder.numberOfItems,
				subtotal: currency.currencyFormat(newOrder.subTotal),
				tax: currency.currencyFormat(newOrder.tax),
				total: currency.currencyFormat(newOrder.total),
			}),
		};

		await sendOrderConfirmedMail('confirm', emailData);

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
	const orders = await Order.find({ user: userId })
		.select('_id isPaid shippingAddress updatedAt')
		.sort({ updatedAt: -1 });
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
		const user = await User.findById(order.user);
		await db.disconnect();

		const pathHandlebars = path.join(__dirname, '../views/orderPaid.handlebars');
		const fileHandlebars = readFileSync(pathHandlebars, 'utf-8');

		const template = Handlebars.compile(fileHandlebars);

		const items = order.orderItems.map((item) => ({
			image: item.image,
			price: currency.currencyFormat(item.price),
			title: item.title,
			size: item.size,
			quantity: item.quantity,
		}));

		const emailData = {
			to: user?.email,
			from: 'rfjiq1986@gmail.com',
			subject: 'Your order has been paid!',
			html: template({
				order: order._id,
				items,
				name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
				address: order.shippingAddress.address,
				city: `${order.shippingAddress.city}, ${order.shippingAddress?.state as string}, ${
					order.shippingAddress.zip
				}`,
				country: order.shippingAddress.country,
				phoneNumber: `${order.shippingAddress.code} ${order.shippingAddress.phone}`,
				totalItems: order.numberOfItems,
				subtotal: currency.currencyFormat(order.subTotal),
				tax: currency.currencyFormat(order.tax),
				total: currency.currencyFormat(order.total),
			}),
		};

		await sendOrderConfirmedMail('paid', emailData);

		res.status(200).json(order);
	} catch (error) {
		await db.disconnect();
		res.status(400).json({ message: 'Server Error.' });
	}
};
