import { Router } from 'express';
import { login, refreshAccessToken, register, updateUserProfile, logout, uploadUserImage } from '../controllers/user.controller';
import accessAuth from '../middlewares/access.middleware';
import upload from '../middlewares/upload';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', accessAuth, logout);
router.get('/profile', accessAuth, (req, res) => {
    res.send('Protected profile data');
});
router.put('/profile', accessAuth, updateUserProfile);
router.post('/upload-image', accessAuth, upload.single('image'), uploadUserImage);


export default router;
