import { EUserRole } from '../../models/user.model';

export type JwtDecoded = {
    id: string;
    name: string;
    email: string;
    picture: string;
    role: EUserRole;
    username: string;
    iat: number;
};
