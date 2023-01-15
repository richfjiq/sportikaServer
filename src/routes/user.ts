import { Router } from 'express';

import { checkJWT, googleAuth, loginUser, registerUser, updateUser } from '../controllers/user';
import { checkJWT as checkJWTMiddleware } from '../middlewares';

const router = Router();

router.put('/:userId', [checkJWTMiddleware], updateUser);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/validate-token', checkJWT);
router.post('/google-auth/:token', googleAuth);

export default router;
