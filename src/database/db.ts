import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoConnection = {
	isConnected: 0,
};

const mongoUrl: string = process.env.MONGO_URL ?? '';

export const connect = async (): Promise<void> => {
	if (mongoConnection.isConnected !== 0) {
		// eslint-disable-next-line no-console
		console.log('We were already connected');
		return;
	}

	if (mongoose.connections.length > 0) {
		mongoConnection.isConnected = mongoose.connections[0].readyState;

		if (mongoConnection.isConnected === 1) {
			// eslint-disable-next-line no-console
			console.log('Using previous connection');
			return;
		}

		await mongoose.disconnect();
	}

	await mongoose.connect(`${mongoUrl}`);
	mongoConnection.isConnected = 1;
	// eslint-disable-next-line no-console
	console.log('Connected to MongoDB:');
};

export const disconnect = async (): Promise<void> => {
	if (process.env.NODE_ENV === 'development') return;

	if (mongoConnection.isConnected === 0) return;

	await mongoose.disconnect();
	mongoConnection.isConnected = 0;

	// eslint-disable-next-line no-console
	console.log('Disconnected from MongoDB');
};
