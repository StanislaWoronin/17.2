import {UserDBModel} from "../modules/super-admin/infrastructure/entity/userDB.model";

export const toCreatedUserViewModel = (
    userDB: UserDBModel,
) => {
    return {
        id: userDB.id,
        login: userDB.login,
        email: userDB.email,
        createdAt: userDB.createdAt,
        banInfo: {
            isBanned: false,
            banDate: null,
            banReason: null,
        },
    };
};
