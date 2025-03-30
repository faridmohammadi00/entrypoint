import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController';
import { registerValidation, loginValidation } from '../validators/userValidator';
import { validate } from '../middleware/validate';

const router = Router();

// Register route (with validation)
router.post('/register', registerValidation, validate, registerUser);

// Login route (with validation)
router.post('/login', loginValidation, validate, loginUser);

// Test page route
router.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Test page accessed successfully',
        timestamp: new Date().toISOString(),
        status: 'active'
    });
});

export default router;
