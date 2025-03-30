import { Router } from 'express';
import { 
    createVisitor, 
    getAllVisitors, 
    getVisitorById, 
    updateVisitor, 
    deleteVisitor 
} from '../controllers/visitorController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Route to create a new visitor (requires authentication)
router.post('/visitors', authenticateUser, createVisitor);

// Route to get all visitors (requires authentication)
router.get('/visitors', authenticateUser, getAllVisitors);

// Route to get a specific visitor by ID (requires authentication)
router.get('/visitors/:id', authenticateUser, getVisitorById);

// Route to update a visitor by ID (requires authentication)
router.put('/visitors/:id', authenticateUser, updateVisitor);

// Route to delete a visitor by ID (requires authentication)
router.delete('/visitors/:id', authenticateUser, deleteVisitor);

export default router;
