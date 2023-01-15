import mongoose, { model, Model, Schema } from 'mongoose';

import { IUser } from '../interfaces/user';

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: {
				values: ['admin', 'client'],
				message: '{VALUE} is not a valid role.',
				default: 'client',
				required: true,
			},
		},
		type: {
			type: String,
			enum: {
				values: ['credentials', 'googleAuthentication'],
				message: '{VALUE} is not a valid type.',
				default: 'credentials',
				required: true,
			},
		},
		customerIdStripe: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

const User: Model<IUser> = mongoose.models.User ?? model('User', userSchema);

export default User;
