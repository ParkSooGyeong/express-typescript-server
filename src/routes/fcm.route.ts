import { Router } from 'express';
import { sendFcmNotification } from '../controllers/fcm.controller';
import accessAuth from '../middlewares/access.middleware';

const router = Router();

// FCM 알림 전송 API
router.post('/send-notification', accessAuth, sendFcmNotification);

export default router;