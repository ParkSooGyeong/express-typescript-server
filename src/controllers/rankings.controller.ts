import { Request, Response } from 'express';
import { Op } from 'sequelize';
import AnalysisSessionStats from '../models/analysisSessionStats.model'


/**
 * @swagger
 * /rankings:
 *   post:
 *     summary: "랭킹 조회"
 *     description: "유저의 특정 타입에 따른 랭킹을 조회합니다."
 *     tags: [Rankings]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: "조회하려는 유저의 ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [coverage, distance, sprint, speed_max, speed_avg, agility_ratio, rate]
 *                 example: "distance"
 *                 description: "조회할 랭킹의 타입"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *                 description: "조회할 데이터의 시작 날짜"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-31"
 *                 description: "조회할 데이터의 종료 날짜"
 *     responses:
 *       200:
 *         description: "성공적으로 랭킹을 조회합니다."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rank:
 *                     type: integer
 *                     description: "랭킹 순위"
 *                     example: 1
 *                   duration:
 *                     type: number
 *                     description: "세션의 지속 시간"
 *                     example: 120
 *                   distance:
 *                     type: number
 *                     description: "세션에서 이동한 거리"
 *                     example: 5000
 *                   sprint:
 *                     type: number
 *                     description: "스프린트 횟수"
 *                     example: 20
 *                   coverage:
 *                     type: number
 *                     description: "커버리지"
 *                     example: 80
 *                   speed_max:
 *                     type: number
 *                     description: "최대 속도"
 *                     example: 32.5
 *                   speed_avg:
 *                     type: number
 *                     description: "평균 속도"
 *                     example: 25.2
 *                   agility_ratio:
 *                     type: number
 *                     description: "민첩성 비율"
 *                     example: 1.2
 *                   rate:
 *                     type: number
 *                     description: "평가 점수"
 *                     example: 90
 *                   isUser:
 *                     type: boolean
 *                     description: "현재 조회된 기록이 유저 본인의 기록인지 여부"
 *                     example: true
 *       400:
 *         description: "잘못된 요청입니다."
 *       500:
 *         description: "서버 내부 에러가 발생했습니다."
 */

export const getRankings = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const { type, start_date, end_date } = req.body;

    let orderField = '';
    switch (type) {
      case 'coverage':
        orderField = 'coverage';
        break;
      case 'distance':
        orderField = 'distance';
        break;
      case 'sprint':
        orderField = 'sprint';
        break;
      case 'speed_max':
        orderField = 'speed_max';
        break;
      case 'speed_avg':
        orderField = 'speed_avg';
        break;
      case 'agility_ratio':
        orderField = 'agility_ratio';
        break;
      case 'rate':
        orderField = 'rate';
        break;
      default:
        return res.status(400).json({ message: 'Invalid ranking type' });
    }

    const dateCondition: any = {};
    if (start_date && end_date) {
      dateCondition.createdAt = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const rankings = await AnalysisSessionStats.findAll({
      where: dateCondition,
      order: [[orderField, 'DESC']],
      limit: 100,
      attributes: ['duration', 'distance', 'sprint', 'coverage', 'speed_max', 'speed_avg', 'agility_ratio', 'rate'],
    });

    const myRecord = await AnalysisSessionStats.findOne({
      where: {
        user_id: user_id,
        ...dateCondition
      },
      attributes: ['duration', 'distance', 'sprint', 'coverage', 'speed_max', 'speed_avg', 'agility_ratio', 'rate'],
    });

    const response = rankings.map((record, index) => ({
      rank: index + 1,
      ...record.get(),
      isUser: record.user_id === parseInt(user_id as string),
    }));

    if (myRecord && !response.find(r => r.isUser)) {
      response.push({
        rank: 'N/A',
        ...myRecord.get(),
        isUser: true
      });
    }
    res.json(response);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
