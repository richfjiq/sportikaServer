import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import adminRoutes from '../routes/admin';
import addressRoutes from '../routes/address';
import orderRoutes from '../routes/orders';
import productRoutes from '../routes/products';
import searchRoutes from '../routes/search';
import userRoutes from '../routes/user';
import paymentRoutes from '../routes/payment';
import homeRoutes from '../routes/home';
import { checkJWT, isAdminRole } from '../middlewares';

dotenv.config();

class Server {
	private readonly app: Application;
	private readonly port: string;
	private readonly apiPaths = {
		home: '/',
		admin: '/api/admin',
		address: '/api/address',
		orders: '/api/orders',
		products: '/api/products',
		search: '/api/search',
		user: '/api/user',
		payment: '/api/payment',
	};

	constructor() {
		this.app = express();
		this.port = process.env.PORT ?? '8080';

		this.middlewares();

		this.routes();
	}

	listen(): void {
		this.app.listen(this.port, () => {
			// eslint-disable-next-line no-console
			console.log(`Server running on port ${this.port}`);
		});
	}

	middlewares(): void {
		// cors
		this.app.use(cors());
		// body parser
		this.app.use(express.json());
	}

	routes(): void {
		this.app.use(this.apiPaths.home, homeRoutes);
		this.app.use(this.apiPaths.admin, [checkJWT, isAdminRole], adminRoutes);
		this.app.use(this.apiPaths.address, addressRoutes);
		this.app.use(this.apiPaths.orders, orderRoutes);
		this.app.use(this.apiPaths.products, productRoutes);
		this.app.use(this.apiPaths.search, searchRoutes);
		this.app.use(this.apiPaths.user, userRoutes);
		this.app.use(this.apiPaths.payment, paymentRoutes);
	}
}

export default Server;
