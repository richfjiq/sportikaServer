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

export interface IUserDataUpdate {
	name: string;
	email: string;
	currentPassword: string;
}

export interface IUserPasswordUpdate {
	currentPassword: string;
	newPassword: string;
}
