import User from '../models/user.model';

export const createUser = async (userData: {
    email: string;
    password: string;
    name: string;
    birthday?: Date;
    marketing?: boolean;
    push?: boolean;
    notice?: boolean;
}) => {
    return await User.create(userData);
};


export const findUserByEmail = async (email: string) => {
    return await User.findOne({ where: { email } });
};

export const updateUserProfileData = async (userId: number, updatedFields: any) => {
    return await User.update(updatedFields, {
        where: { id: userId },
        returning: true // 업데이트된 데이터를 반환
    }).then(([rowsUpdated, [updatedUser]]) => {
        return updatedUser;
    });
};
export const findUserById = async (userId: number) => {
    return await User.findByPk(userId);
};
