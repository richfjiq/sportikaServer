export const isValidEmail = (email: string): boolean => {
	const match = String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
		);

	if (match === null) return false;

	return true;
};

export const isEmail = (email: string): string | undefined => {
	return isValidEmail(email) ? undefined : 'Email not valid.';
};
