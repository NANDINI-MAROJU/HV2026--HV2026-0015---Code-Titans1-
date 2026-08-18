import { Router } from 'express';
import { createComplaint, getMyComplaints, getComplaintById, submitFeedback, reopenComplaint } from '../controllers/complaintController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();
router.use(authenticateToken);
router.post('/', upload.single('attachment'), createComplaint);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);
router.post('/:id/feedback', submitFeedback);
router.post('/:id/reopen', reopenComplaint);
export default router;
