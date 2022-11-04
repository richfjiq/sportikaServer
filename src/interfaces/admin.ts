import { IOrder } from './order';
import { IProduct } from './products';
import { IUser } from './user';

export type DataDashboard =
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

export type DataOrders =
	| {
			message: string;
	  }
	| IOrder[];

export type DataProducts =
	| {
			message: string;
	  }
	| IProduct[]
	| IProduct;

export interface DataUpload {
	message: string;
}

export type DataUsers =
	| {
			message: string;
	  }
	| IUser[];
