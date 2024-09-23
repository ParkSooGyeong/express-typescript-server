// src/services/fcm.service.ts
import fcm from '../config/fcm';  // fcm 객체를 사용

export const sendFcmNotification = async (fcmTokens: string[], payload: any) => {
    try {
        const response = await fcm.sendMulticast({
            tokens: fcmTokens,  // 여러 기기에 FCM 메시지 전송
            notification: payload.notification,
        });

        return {
            successCount: response.successCount,
            failureCount: response.failureCount,
            errors: response.responses.filter((r) => !r.success),
        };
    } catch (error) {
        console.error('FCM 전송 중 오류 발생:', error);
        throw error;
    }
};
