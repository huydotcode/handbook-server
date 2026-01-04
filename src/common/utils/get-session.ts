import { Request } from 'express';
import { jwt } from './jwt';

interface User {
    id: string;
    name: string;
    email: string;
    picture: string;
    role: string;
    username: string;
    iat: number;
    exp: number;
}

export const getSession = async (req: Request) => {
    const token = req.cookies['next-auth.session-token'];
    if (!token) return null;

    const user = jwt.verify(token);
    if (!user) return null;

    return user;
};
