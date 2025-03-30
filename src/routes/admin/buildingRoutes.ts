import { Router } from 'express';
import { 
    getAllBuildings, 
    getBuildingById, 
    createBuilding, 
    updateBuilding, 
    deleteBuilding,
    activateBuilding,
    inactivateBuilding 
} from '../../controllers/Admin/buildingController';
import { authenticateUser } from '../../middleware/authMiddleware';

const router = Router();

// Protect all routes with authentication
router.use(authenticateUser);

// CRUD routes
router.get('/buildings', getAllBuildings);
router.get('/buildings/:id', getBuildingById);
router.post('/buildings', createBuilding);
router.put('/buildings/:id', updateBuilding);
router.delete('/buildings/:id', deleteBuilding);

// Activate and inactivate building routes
router.put('/buildings/:id/activate', activateBuilding);
router.put('/buildings/:id/inactivate', inactivateBuilding);

export default router; 