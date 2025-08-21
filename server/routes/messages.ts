import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { requireAuth } from '../Middleware/auth';

const router = express.Router();

router.post('/', requireAuth, sendMessage);
router.get('/:friendId', requireAuth, getMessages);

export default router; 