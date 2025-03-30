import { Router } from 'express';
import { 
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    activatePlan,
    inactivatePlan
} from '../../controllers/Admin/planController';
import { authenticateUser } from '../../middleware/authMiddleware';

const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// CRUD routes
router.get('/plans', getAllPlans);
router.get('/plans/:id', getPlanById);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);

// Status management routes
router.put('/plans/:id/activate', activatePlan);
router.put('/plans/:id/inactivate', inactivatePlan);

export default router; 