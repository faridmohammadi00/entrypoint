import { Router } from 'express';
import { 
    createCreditTransaction, 
    getAllCreditTransactions, 
    getCreditTransactionById, 
    softDeleteCreditTransaction, 
    restoreCreditTransaction 
} from '../controllers/creditTransactionController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Route to create a new credit transaction (requires authentication)
router.post('/credit-transactions', authenticateUser, createCreditTransaction);

// Route to get all credit transactions (requires authentication)
router.get('/credit-transactions', authenticateUser, getAllCreditTransactions);

// Route to get a specific credit transaction by ID (requires authentication)
router.get('/credit-transactions/:id', authenticateUser, getCreditTransactionById);

// Route to delete a credit transaction by ID (requires authentication)
router.delete('/credit-transactions/:id', authenticateUser, softDeleteCreditTransaction);

// Route to restore a soft-deleted credit transaction by ID (requires authentication)
router.put('/credit-transactions/:id/restore', authenticateUser, restoreCreditTransaction);

export default router;
