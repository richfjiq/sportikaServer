import { ISize } from './products';
import { IUser } from './user';

export interface IOrder {
	_id?: string;
	user?: string | IUser;
	orderItems: IOrderItem[];
	shippingAddress: ShippingAddress;
	paymentResult?: string;
	numberOfItems: number;
	subTotal: number;
	tax: number;
	total: number;
	isPaid: boolean;
	paidAt?: string;
	transactionId?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface IOrderItem {
	_id: string;
	title: string;
	size: ISize;
	quantity: number;
	slug: string;
	image: string;
	price: number;
	gender: string;
}

export interface ShippingAddress {
	firstName: string;
	lastName: string;
	address: string;
	address2?: string;
	zip: string;
	city: string;
	state?: string;
	country: string;
	code: string;
	phone: string;
}
