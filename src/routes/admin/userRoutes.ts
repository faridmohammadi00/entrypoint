import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, activateUser, inactivateUser } from '../../controllers/Admin/userController';
import { authenticateUser } from '../../middleware/authMiddleware';

const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// Add the new create user route
router.post('/users', createUser);

// CRUD routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Activate and inactivate user routes
router.put('/users/:id/activate', authenticateUser, activateUser);
router.put('/users/:id/inactivate', authenticateUser, inactivateUser);

export default router;
