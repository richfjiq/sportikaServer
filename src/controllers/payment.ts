import { Request, Response } from 'express';
import { Stripe } from 'stripe';
import dotenv from 'dotenv';
import { db } from '../database';
import { Order, User } from '../models';

dotenv.config();
const secretKey = process.env.STRIPE_SECRET_KEY as string;
const stripe = new Stripe(secretKey, {
	apiVersion: '2022-11-15',
});

export const getConfig = async (req: Request, res: Response): Promise<void> => {
	const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
	const config = {
		publishableKey,
	};

	res.status(201).json(config);
};

export const paymentSheet = async (req: Request, res: Response): Promise<void> => {
	const { orderId } = req.params;
	let customerId = '';

	try {
		await db.connect();
		const order = await Order.findById(orderId);
		const user = await User.findById(order?.user);

		customerId = user?.customerIdStripe as string;

		if (user?.customerIdStripe === undefined) {
			const customer = await stripe.customers.create();
			await User.findByIdAndUpdate(order?.user, { customerIdStripe: customer.id });
			customerId = customer.id;
		}

		await db.disconnect();

		const ephemeralKey = await stripe.ephemeralKeys.create(
			{ customer: customerId },
			{ apiVersion: '2020-03-02' },
		);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: Number(order?.total) * 100,
			currency: 'usd',
			customer: customerId,
			automatic_payment_methods: {
				enabled: true,
			},
		});

		res.status(201).json({
			customer: customerId,
			ephemeralKey: ephemeralKey.secret,
			paymentIntent: paymentIntent.client_secret,
		});
	} catch (error) {
		await db.disconnect();
		res.status(404).json({ message: 'Server Error.' });
	}
};
