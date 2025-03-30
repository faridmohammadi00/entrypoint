import { Router } from 'express';
import { 
    getAllVisitors, 
    getVisitorById, 
    createVisitor, 
    updateVisitor, 
    deleteVisitor,
    activateVisitor,
    inactivateVisitor 
} from '../../controllers/Admin/visitorController';
import { authenticateUser } from '../../middleware/authMiddleware';

const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// CRUD routes
router.get('/visitors', getAllVisitors);
router.get('/visitors/:id', getVisitorById);
router.post('/visitors', createVisitor);
router.put('/visitors/:id', updateVisitor);
router.delete('/visitors/:id', deleteVisitor);

// Activate and inactivate visitor routes
router.put('/visitors/:id/activate', activateVisitor);
router.put('/visitors/:id/inactivate', inactivateVisitor);

export default router; 