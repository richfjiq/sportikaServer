import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';

import { db } from '../database';
import {
	DataDashboard,
	DataOrders,
	DataProducts,
	DataUpload,
	DataUsers,
	IProduct,
} from '../interfaces';
import { Order, Product, User } from '../models';

export const dashboardInfo = async (req: Request, res: Response<DataDashboard>): Promise<void> => {
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

export const getOrders = async (req: Request, res: Response<DataOrders>): Promise<void> => {
	await db.connect();
	const orders = await Order.find()
		.sort({ createdAt: 'desc' })
		.populate('user', 'name email')
		.lean();
	await db.disconnect();

	res.status(200).json(orders);
};

export const getProducts = async (req: Request, res: Response<DataProducts>): Promise<void> => {
	await db.connect();
	const products = await Product.find().sort({ title: 'asc' }).lean();
	await db.disconnect();
	res.status(200).json(products);
};

export const createProduct = async (req: Request, res: Response<DataProducts>): Promise<void> => {
	const { images = [] } = req.body as IProduct;

	if (images.length < 2) {
		res.status(400).json({ message: 'Product needs at least 2 images.' });
		return;
	}

	try {
		await db.connect();

		const productInDb = await Product.findOne({ slug: req.body.slug });

		if (productInDb !== null) {
			await db.disconnect();
			res.status(400).json({ message: 'Product already exists.' });
			return;
		}

		const product = new Product(req.body);
		await product.save();
		await db.disconnect();

		res.status(201).json(product);
	} catch (error) {
		await db.disconnect();
		res.status(400).json({ message: 'Check server logs.' });
	}
};

export const updateProduct = async (req: Request, res: Response<DataProducts>): Promise<void> => {
	const { _id = '', images = [] } = req.body as IProduct;

	if (!isValidObjectId(_id)) {
		res.status(400).json({ message: 'Product id is not valid.' });
		return;
	}

	if (images.length < 2) {
		res.status(400).json({ message: 'At least 2 images are required.' });
		return;
	}

	try {
		await db.connect();

		const product = await Product.findById(_id);

		if (product === null) {
			await db.disconnect();
			res.status(400).json({ message: 'There is no product with this id.' });
			return;
		}

		// https://res.cloudinary.com/dlz1bhh8j/image/upload/v1659375333/sportika/ucfgfj3qylagifaen4hc.jpg
		product.images.forEach(async (image) => {
			if (!images.includes(image)) {
				const [fileId] = image.substring(image.lastIndexOf('/') + 1).split('.');
				await cloudinary.uploader.destroy(`sportika/${fileId}`);
			}
		});

		await product.update(req.body);
		await db.disconnect();

		res.status(200).json(product);
	} catch (error) {
		await db.disconnect();
		res.status(400).json({ message: 'Check the server logs.' });
	}
};

const saveFile = async (file: formidable.File): Promise<string> => {
	const cloudinaryFile = await cloudinary.uploader.upload(file.filepath, {
		folder: 'sportika',
	});
	return cloudinaryFile.secure_url;
};

const parseFiles = async (req: Request): Promise<string> => {
	return await new Promise((resolve, reject) => {
		const form = new formidable.IncomingForm();
		form.parse(req, async (err, fields, files) => {
			// if (err) {
			if (err instanceof Error) {
				return reject(err);
			}

			const filePath = await saveFile(files.file as formidable.File);
			resolve(filePath);
		});
	});
};

export const uploadFile = async (req: Request, res: Response<DataUpload>): Promise<void> => {
	const imageUrl = await parseFiles(req);
	res.status(200).json({ message: imageUrl });
};

export const getUsers = async (req: Request, res: Response<DataUsers>): Promise<void> => {
	await db.connect();
	const users = await User.find().select('-password').lean();
	await db.disconnect();
	res.status(200).json(users);
};

export const updateUsers = async (req: Request, res: Response<DataUsers>): Promise<void> => {
	const { userId = '', role = '' } = req.body;

	if (!isValidObjectId(userId)) {
		res.status(400).json({ message: 'There is no user with this id.' });
		return;
	}

	const validRoles = ['admin', 'client'];
	if (!validRoles.includes(role)) {
		res.status(404).json({ message: 'Role not allowed.' });
		return;
	}

	await db.connect();
	const user = await User.findById(userId);
	if (user === null) {
		await db.disconnect();
		res.status(404).json({ message: `User not found: ${String(userId)}` });
		return;
	}
	user.role = role;
	await user.save();
	await db.disconnect();

	res.status(200).json({ message: 'Updated user.' });
};
