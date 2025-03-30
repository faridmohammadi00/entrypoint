import { Router } from 'express';
import { 
    createBuilding, 
    getAllBuildings, 
    getBuildingById, 
    updateBuilding, 
    deleteBuilding,
    activateBuilding,
    deactivateBuilding
} from '../controllers/buildingController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// Route to create a new building (requires authentication)
router.post('/buildings', authenticateUser, createBuilding);

// Route to get all buildings (requires authentication)
router.get('/buildings', authenticateUser, getAllBuildings);

// Route to get a specific building by ID (requires authentication)
router.get('/buildings/:id', authenticateUser, getBuildingById);

// Route to update a building by ID (only the owner can update, requires authentication)
router.put('/buildings/:id', authenticateUser, updateBuilding);

// Route to delete a building by ID (only the owner can delete, requires authentication)
router.delete('/buildings/:id', authenticateUser, deleteBuilding);

// Route to activate a building by ID (only the owner can activate, requires authentication)
router.put('/buildings/:id/activate', authenticateUser, activateBuilding);

// Route to deactivate a building by ID (only the owner can deactivate, requires authentication)
router.put('/buildings/:id/deactivate', authenticateUser, deactivateBuilding);

export default router;
