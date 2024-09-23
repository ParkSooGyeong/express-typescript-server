import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Access Token 생성
export const generateAccessToken = (userId: number) => {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
};

// Refresh Token 검증 및 새로운 Access Token 발급
export const refreshTokens = (refreshToken: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err: any, decoded: any) => {
            if (err) {
                return reject(err);
            }

            const newAccessToken = generateAccessToken(decoded.userId);
            resolve(newAccessToken);
        });
    });
};

export const findUserById = async (userId: number) => {
    return await User.findByPk(userId);
};
