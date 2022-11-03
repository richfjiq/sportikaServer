import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productRoutes from '../routes/products';
import searchRoutes from '../routes/search';
import userRoutes from '../routes/user';

dotenv.config();

class Server {
	private readonly app: Application;
	private readonly port: string;
	private readonly apiPaths = {
		products: '/api/products',
		search: '/api/search',
		user: '/api/user',
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
		this.app.use(this.apiPaths.products, productRoutes);
		this.app.use(this.apiPaths.search, searchRoutes);
		this.app.use(this.apiPaths.user, userRoutes);
	}
}

export default Server;
