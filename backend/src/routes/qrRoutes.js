import { Router } from 'express';
import { generateQRLocation, getAllQRLocations } from '../controllers/qrController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/locations', getAllQRLocations);
router.post('/generate', authenticateToken, requireRole('admin'), generateQRLocation);
export default router;
