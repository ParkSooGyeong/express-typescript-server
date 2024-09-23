import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';
import path from 'path';
import { createUser, findUserByEmail, updateUserProfileData, findUserById } from '../services/user.service';
import { generateAccessToken } from '../services/token.service';
import redisClient from '../config/redis';
import transporter from '../config/nodemailer';
import { generateRandomPassword } from '../utils/generatePassword'

interface MulterS3File {
    key: string;
    location: string;
    mimetype: string;
    size: number;
    originalname: string;
}
/**
 * @swagger
 * /register:
 *   post:
 *     summary: "회원 가입"
 *     description: "새로운 사용자를 등록합니다."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: "성공적으로 사용자 등록"
 *       500:
 *         description: "서버 에러"
 */

export const register = async (req: Request, res: Response) => {
    const { email, password, name, birthday, marketing, push, notice } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser({
            email,
            password: hashedPassword,
            name,
            birthday,
            marketing,
            push,
            notice,
        });

        // 환영 이메일 전송
        const emailTemplatePath = path.join(__dirname, '../templates/signup.ejs');
        const html = await ejs.renderFile(emailTemplatePath, { user: newUser });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '회원가입을 환영합니다!',
            html,
        });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// 로그인
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(403).json({ message: 'Incorrect password' });

        // Access Token 발급
        const accessToken = generateAccessToken(user.id);

        // Refresh Token 발급 및 Redis 저장
        const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });
        await redisClient.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7일간 저장

        res.cookie('access_token', accessToken, { httpOnly: true });
        res.cookie('refresh_token', refreshToken, { httpOnly: true });

        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error });
    }
};

// Access Token 갱신
export const refreshAccessToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const userId = req.body.userId;

    if (!refreshToken) return res.status(401).json({ message: 'Refresh token is required' });

    try {
        const storedRefreshToken = await redisClient.get(`refresh_token:${userId}`);
        if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(userId);
        res.cookie('access_token', newAccessToken, { httpOnly: true });
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(500).json({ message: 'Error refreshing access token', error });
    }
};

// 로그아웃
export const logout = async (req: Request, res: Response) => {
    const userId = req.body.userId;

    try {
        await redisClient.del(`refresh_token:${userId}`);
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out', error });
    }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const { email, password, name, birthday, marketing, push, notice, token, fcm } = req.body;

    try {
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const updatedFields: any = {};
        if (email) updatedFields.email = email;
        if (hashedPassword) updatedFields.password = hashedPassword;
        if (name) updatedFields.name = name;
        if (birthday) updatedFields.birthday = birthday;
        if (marketing !== undefined) updatedFields.marketing = marketing;
        if (push !== undefined) updatedFields.push = push;
        if (notice !== undefined) updatedFields.notice = notice;
        if (token) updatedFields.token = token;
        if (fcm) updatedFields.fcm = fcm;

        const updatedUser = await updateUserProfileData(userId, updatedFields);
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};

// 비밀번호 찾기
export const resetPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 랜덤 임시 비밀번호 생성
        const tempPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // 사용자 비밀번호 업데이트
        await updateUserProfileData(user.id, { password: hashedPassword });

        // 이메일 템플릿 로드 및 랜더링
        const emailTemplatePath = path.join(__dirname, '../templates/password.ejs');
        const html = await ejs.renderFile(emailTemplatePath, { tempPassword, user });

        // 이메일 전송
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '비밀번호 재설정 안내',
            html,
        });

        res.status(200).json({ message: 'Temporary password sent to your email' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error });
    }
};

export const uploadUserImage = async (req: Request, res: Response) => {
    const userId = req.body.userId;

    try {
        const user = await findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const file = req.file as any;  // 타입 검사 우회

        if (!file || !file.location) {
            return res.status(400).json({ message: 'No file uploaded or invalid S3 response' });
        }

        const imageUrl = file.location;
        user.img = imageUrl;
        await user.save();

        res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error });
    }
};