import { Request, Response } from 'express';
import fcm from '../config/fcm';
import User from '../models/user.model';

interface FcmRequestBody {
    emails: string[];
    title: string;
    message: string;
}

/**
 * @swagger
 * /fcm/send:
 *   post:
 *     summary: "FCM 알림 전송"
 *     description: "사용자의 이메일 리스트를 기반으로 FCM 알림을 전송합니다."
 *     tags: [FCM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "알림을 보낼 사용자의 이메일 리스트"
 *                 example: ["user1@example.com", "user2@example.com"]
 *               title:
 *                 type: string
 *                 description: "알림 제목"
 *                 example: "알림 제목"
 *               message:
 *                 type: string
 *                 description: "알림 메시지"
 *                 example: "이것은 테스트 알림 메시지입니다."
 *     responses:
 *       200:
 *         description: "FCM 알림 전송 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: "알림 전송 성공 메시지"
 *                   example: "알림 전송 성공"
 *                 successCount:
 *                   type: integer
 *                   description: "성공적으로 전송된 알림 수"
 *                   example: 2
 *                 failureCount:
 *                   type: integer
 *                   description: "전송에 실패한 알림 수"
 *                   example: 0
 *       400:
 *         description: "잘못된 요청 (이메일 리스트 없음 또는 FCM 토큰 없음)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "이메일 리스트를 제공해주세요."
 *       404:
 *         description: "사용자 없음"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자 없음"
 *       500:
 *         description: "서버 내부 오류 (FCM 전송 실패)"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "FCM 전송 중 오류 발생"
 */


export const sendFcmNotification = async (req: Request<{}, {}, FcmRequestBody>, res: Response) => {
    const { emails, title, message } = req.body;

    if (!emails || emails.length === 0) {
        return res.status(400).json({ message: '이메일 리스트를 제공해주세요.' });
    }

    try {
        const users = await User.findAll({
            where: {
                email: emails
            },
            attributes: ['fcm']
        });

        if (users.length === 0) {
            return res.status(404).json({ message: '사용자 없음' });
        }

        const tokens = users.map(user => user.fcm).filter(token => token);

        if (tokens.length === 0) {
            return res.status(400).json({ message: 'FCM 토큰 없음' });
        }
        const payload = {
            notification: {
                title: title || '안녕하세요',
                body: message || 'fcm 테스트',
            },
            tokens,
        };

        const response = await fcm.sendMulticast(payload);

        return res.status(200).json({
            message: '알림 전송 성공',
            successCount: response.successCount,
            failureCount: response.failureCount,
        });

    } catch (error) {
        console.error('FCM 전송 오류:', error);
        return res.status(500).json({ message: 'FCM 전송 중 오류 발생', error });
    }
};
