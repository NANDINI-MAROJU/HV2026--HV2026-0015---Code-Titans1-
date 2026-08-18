import { Router } from 'express';
import { createComplaint, getMyComplaints, getComplaintById, submitFeedback, reopenComplaint } from '../controllers/complaintController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
/*import { getUserNotifications, markNotificationsAsRead } from '../services/notificationService.js';

router.get('/notifications/:userId', (req, res) => {
  const notifications = getUserNotifications(req.params.userId);
  res.json(notifications);
});

router.patch('/notifications/read/:userId', (req, res) => {
  markNotificationsAsRead(req.params.userId);
  res.json({ success: true });
});*/
const router = Router();
router.use(authenticateToken);
router.post('/', upload.single('attachment'), createComplaint);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);
router.post('/:id/feedback', submitFeedback);
router.post('/:id/reopen', reopenComplaint);
export default router;
