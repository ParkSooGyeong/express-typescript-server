import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

class User extends Model {
    public id!: number;
    public email!: string;
    public password!: string;
    public name!: string;
    public birthday!: Date;
    public marketing!: boolean;
    public push!: boolean;
    public notice!: boolean;
    public token!: string;
    public fcm!: string;
    public img!: string | null;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        birthday: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        marketing: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        push: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        notice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fcm: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        img: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize,
        modelName: 'User',
    }
);

export default User;
