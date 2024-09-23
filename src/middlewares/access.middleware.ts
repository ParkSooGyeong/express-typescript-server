import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { refreshTokens, generateAccessToken } from '../services/token.service';
import redisClient from '../config/redis';

const accessAuth = (req: Request, res: Response, next: NextFunction) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
        return res.status(403).send({ message: `This connection is not allowed` });
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err:any, decoded: any) => {
        if (err) {
            return res.status(403).send({ message: `Not a valid token` });
        }

        // 토큰이 만료된 경우 처리
        if (currentTime > decoded.exp) {
            const refreshToken = req.cookies.refresh_token;
            if (!refreshToken) {
                return res.status(403).send({ message: 'Token has expired, and no refresh token provided' });
            }

            // Redis에서 Refresh Token 검증
            redisClient.get(`refresh_token:${decoded.userId}`)
                .then(storedRefreshToken => {
                    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
                        return res.status(403).send({ message: 'Invalid refresh token' });
                    }

                    // Refresh Token이 유효하면 새로운 Access Token 발급
                    const newAccessToken = generateAccessToken(decoded.userId);
                    res.cookie('access_token', newAccessToken, { httpOnly: true });
                    next();
                })
                .catch(() => res.status(500).send({ message: 'Error processing token' }));
        } else {
            next(); // 토큰이 유효하면 다음 미들웨어로 넘김
        }
    });
};

export default accessAuth;
