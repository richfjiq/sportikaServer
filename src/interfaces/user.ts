export interface IUser {
	_id: string;
	name: string;
	email: string;
	password?: string;
	role: string;
	type?: string;
	customerIdStripe?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface IUserUpdate {
	name: string;
	email: string;
	currentPassword: string;
	newPassword: string;
	newPassword2: string;
}
