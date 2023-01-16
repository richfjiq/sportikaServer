import { Router } from 'express';

import {
	checkJWT,
	googleAuth,
	loginUser,
	registerUser,
	updateUserAccount,
	updateUserPassword,
} from '../controllers/user';
import { checkJWT as checkJWTMiddleware } from '../middlewares';

const router = Router();

router.put('/account/:userId', [checkJWTMiddleware], updateUserAccount);
router.put('/password/:userId', [checkJWTMiddleware], updateUserPassword);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/validate-token', checkJWT);
router.post('/google-auth/:token', googleAuth);

export default router;
