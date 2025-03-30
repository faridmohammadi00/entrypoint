import { Router } from 'express';
import { 
    createVisit, 
    getAllVisits, 
    getVisitById, 
    updateVisit 
} from '../controllers/visitController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Route to create a new visit record (requires authentication)
router.post('/visits', authenticateUser, createVisit);

// Route to get all visit records (requires authentication)
router.get('/visits', authenticateUser, getAllVisits);

// Route to get a specific visit record by ID (requires authentication)
router.get('/visits/:id', authenticateUser, getVisitById);

// Route to update a visit record (check-out date or status, requires authentication)
router.put('/visits/:id', authenticateUser, updateVisit);

export default router;
