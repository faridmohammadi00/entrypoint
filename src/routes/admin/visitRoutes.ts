import { Router } from 'express';
import { 
    getAllVisits,
    getVisitById,
    createVisit,
    updateVisit,
    deleteVisit,
    completeVisit,
    cancelVisit
} from '../../controllers/Admin/visitController';
import { authenticateUser } from '../../middleware/authMiddleware';

const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// CRUD routes
router.get('/visits', getAllVisits);
router.get('/visits/:id', getVisitById);
router.post('/visits', createVisit);
router.put('/visits/:id', updateVisit);
router.delete('/visits/:id', deleteVisit);

// Status management routes
router.put('/visits/:id/complete', completeVisit);
router.put('/visits/:id/cancel', cancelVisit);

export default router; 