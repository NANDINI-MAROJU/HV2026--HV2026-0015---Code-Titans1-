import { Router } from 'express';
import { getAllComplaints, updateComplaint, getDashboardStats } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticateToken, requireRole('admin'));
router.get('/complaints', getAllComplaints);
router.patch('/complaints/:id', updateComplaint);
router.get('/stats', getDashboardStats);
export default router;
