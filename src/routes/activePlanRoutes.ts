import { Router } from 'express';
import { 
    createActivePlan, 
    getUserActivePlans,
    cancelActivePlan,
} from '../controllers/activePlanController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Route to create a new active plan (requires authentication)
router.post('/active-plans', authenticateUser, createActivePlan);

// Route to get the active plans for a specific user (requires authentication)
router.get('/active-plans/:userId', authenticateUser, getUserActivePlans);

// Route to cancel an active plan (requires authentication)
router.put('/active-plans/:id/cancel', authenticateUser, cancelActivePlan);


export default router;
