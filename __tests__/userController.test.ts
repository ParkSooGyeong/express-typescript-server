import { Request, Response } from 'express';
import { register, login, logout, updateUserProfile, refreshAccessToken, resetPassword, uploadUserImage } from '../src/controllers/user.controller';
import { createUser, findUserByEmail, updateUserProfileData, findUserById } from '../src/services/user.service';
import { generateAccessToken } from '../src/services/token.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redisClient from '../src/config/redis';
import transporter from '../src/config/nodemailer';
import ejs from 'ejs';

// Mocking 필요한 외부 모듈
jest.mock('../src/services/user.service');
jest.mock('../src/services/token.service');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../src/config/redis');
jest.mock('../src/config/nodemailer');
jest.mock('ejs');

describe('User Controller', () => {
    
    describe('register', () => {
        it('should register a new user and send a welcome email', async () => {
            const req = {
                body: {
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'John Doe',
                    birthday: '1990-01-01',
                    marketing: true,
                    push: true,
                    notice: true,
                },
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as any;

            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
            (createUser as jest.Mock).mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                name: 'John Doe',
            });
            (ejs.renderFile as jest.Mock).mockResolvedValue('<h1>Welcome</h1>');
            (transporter.sendMail as jest.Mock).mockResolvedValue(true);

            await register(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(createUser).toHaveBeenCalled();
            expect(ejs.renderFile).toHaveBeenCalled();
            expect(transporter.sendMail).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User registered successfully',
                user: expect.any(Object),
            });
        });
    });

    describe('login', () => {
        it('should login a user and return tokens', async () => {
            const req = {
                body: { email: 'test@example.com', password: 'password123' },
            } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                cookie: jest.fn(),
            } as any;

            const mockUser = { id: 1, email: 'test@example.com', password: 'hashed_password' };
            (findUserByEmail as jest.Mock).mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (generateAccessToken as jest.Mock).mockReturnValue('access_token');
            (jwt.sign as jest.Mock).mockReturnValue('refresh_token');
            (redisClient.set as jest.Mock).mockResolvedValue(true);

            await login(req, res);

            expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
            expect(generateAccessToken).toHaveBeenCalledWith(mockUser.id);
            expect(jwt.sign).toHaveBeenCalled();
            expect(redisClient.set).toHaveBeenCalled();
            expect(res.cookie).toHaveBeenCalledWith('access_token', 'access_token', { httpOnly: true });
            expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh_token', { httpOnly: true });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                accessToken: 'access_token',
                refreshToken: 'refresh_token',
            });
        });
    });

    describe('logout', () => {
        it('should log out the user and clear tokens', async () => {
            const req = { body: { userId: 1 } } as Request;
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                clearCookie: jest.fn(),
            } as any;

            (redisClient.del as jest.Mock).mockResolvedValue(true);

            await logout(req, res);

            expect(redisClient.del).toHaveBeenCalledWith('refresh_token:1');
            expect(res.clearCookie).toHaveBeenCalledWith('access_token');
            expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
        });
    });
});
