import { Router } from 'express';
import { searchProducts } from '../controllers/search';

const router = Router();

router.get('/', searchProducts);

export default router;
