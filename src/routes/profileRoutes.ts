import { Router } from 'express';
import { 
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/profileController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/change-password', changePassword);

export default router; 