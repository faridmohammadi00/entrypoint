import { Router } from 'express';
import { 
    getActivePlans,
    getActivePlanById
} from '../controllers/planController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Protect routes with authentication
router.use(authenticateUser);

// Plan routes for regular users
router.get('/plans', getActivePlans);
router.get('/plans/:id', getActivePlanById);

export default router;
