import { Router } from 'express';
import { getRankings } from '../controllers/rankings.controller';
import accessAuth from '../middlewares/access.middleware';

const router = Router();

router.post('/', accessAuth, getRankings);

export default router;
