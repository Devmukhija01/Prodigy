import express from 'express';
import { sendFriendRequest, getPendingRequests, updateFriendRequestStatus, getFriends, getAllFriendRequests,getAcceptedFriends } from '../controllers/friendRequestController';
import { requireAuth } from '../Middleware/auth';

const router = express.Router();

router.post('/', requireAuth, sendFriendRequest); // expects { toUserId }
router.get('/pending', requireAuth, getPendingRequests);
router.patch('/:requestId', requireAuth, updateFriendRequestStatus);
router.get('/friends', requireAuth, getFriends);
router.get('/debug/all', requireAuth, getAllFriendRequests); // Debug endpoint
router.get("/accepted/:userId", getAcceptedFriends);
export default router;