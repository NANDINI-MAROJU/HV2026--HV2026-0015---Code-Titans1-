import { Router } from 'express';
import { getAssignedTasks, updateTaskProgress } from '../controllers/staffController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();
router.use(authenticateToken, requireRole('staff', 'admin'));
router.get('/tasks', getAssignedTasks);
router.patch('/tasks/:id', upload.single('resolution_proof'), updateTaskProgress);
export default router;
