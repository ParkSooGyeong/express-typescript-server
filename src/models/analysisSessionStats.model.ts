import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './user.model';

class AnalysisSessionStats extends Model {
    public id!: number;
    public user_id!: number;
    public duration!: number;
    public distance!: number;
    public sprint!: number;
    public coverage!: number;
    public speed_max!: number;
    public speed_avg!: number;
    public agility_ratio!: number;
    public rate!: number;
}

AnalysisSessionStats.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: 'users',  // users 테이블 참조
                key: 'id',
            },
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        distance: {
            type: DataTypes.FLOAT(10, 2),
            allowNull: false,
        },
        sprint: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        coverage: {
            type: DataTypes.FLOAT(10, 2),
            allowNull: false,
        },
        speed_max: {
            type: DataTypes.FLOAT(10, 2),
            allowNull: false,
        },
        speed_avg: {
            type: DataTypes.FLOAT(10, 2),
            allowNull: false,
        },
        agility_ratio: {
            type: DataTypes.FLOAT(10, 2),
            allowNull: false,
        },
        rate: {
            type: DataTypes.FLOAT(10, 2),
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'AnalysisSessionStats',
    }
);

AnalysisSessionStats.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export default AnalysisSessionStats;
