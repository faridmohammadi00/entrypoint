import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware';
import { assignDoorman, removeDoorman, getDoormenForBuilding, getDoormanAssignment, listDoormen, registerDoorman, editDoorman, getDoormanById, activateAssignment, deactivateAssignment } from '../controllers/doormanController';

const router = Router();

// Assign a doorman to a building
router.post('/assign', authenticateUser, assignDoorman);

// Remove a doorman from a building
router.delete('/remove', authenticateUser, removeDoorman);

// Get all doormen assigned to a building
router.get('/:buildingId/doormen', authenticateUser, getDoormenForBuilding);

// Get a specific doorman's assignment for a building
router.get('/:buildingId/doorman/:userId', authenticateUser, getDoormanAssignment);

// List all doormen
router.get('/', authenticateUser, listDoormen);

// Register a new doorman
router.post('/register', authenticateUser, registerDoorman);

// Edit a doorman
router.put('/:id', authenticateUser, editDoorman);

// Get doorman by ID
router.get('/:id', authenticateUser, getDoormanById);

// Activate doorman building assignment
router.post('/assignment/activate', activateAssignment);

// Deactivate doorman building assignment
router.post('/assignment/deactivate', deactivateAssignment);

export default router;
