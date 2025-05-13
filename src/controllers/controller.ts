import { IncomingMessage, ServerResponse } from 'http';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../services/service.ts';
import { validateUUID, validateUserData } from '../utils/validate.ts';
import { parse } from 'url';
import { AppError, handleError } from '../utils/errorHandler.ts';

let reqRef: IncomingMessage;
let resRef: ServerResponse;

const send = (status: number, data?: object) => {
    resRef.writeHead(status, { 'Content-Type': 'application/json' });
    resRef.end(data ? JSON.stringify(data) : undefined);
};

const handleBody = (req: IncomingMessage, callback: (body: string) => void) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => callback(body));
};

export const getAllUsersHandler = async () => {
    try {
        const users = await getAllUsers();
        send(200, users);
    } catch (error: any) {
        handleError(error, resRef);
    }
};

export const getUserByIdHandler = async () => {
    try {
        const userId = getIdFromPath();
        if (!validateUUID(userId)) {
            throw new AppError(400, 'Invalid UUID format');
        }

        const user = await getUserById(userId);
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        send(200, user);
    } catch (error: any) {
        handleError(error, resRef);
    }
};

export const createUserHandler = () => {
    handleBody(reqRef, async body => {
        try {
            const data = JSON.parse(body);
            if (!validateUserData(data)) {
                throw new AppError(400, 'Invalid user data');
            }

            const user = await createUser(data);
            send(201, user);
        } catch (error: any) {
            if (error instanceof SyntaxError) {
                handleError(new AppError(400, 'Invalid JSON format'), resRef);
            } else {
                handleError(error, resRef);
            }
        }
    });
};

export const updateUserHandler = () => {
    const userId = getIdFromPath();
    if (!validateUUID(userId)) {
        handleError(new AppError(400, 'Invalid UUID format'), resRef);
        return;
    }

    handleBody(reqRef, async body => {
        try {
            const data = JSON.parse(body);
            if (!validateUserData(data)) {
                throw new AppError(400, 'Invalid user data');
            }

            const updated = await updateUser(userId, data);
            if (!updated) {
                throw new AppError(404, 'User not found');
            }

            send(200, updated);
        } catch (error: any) {
            if (error instanceof SyntaxError) {
                handleError(new AppError(400, 'Invalid JSON format'), resRef);
            } else {
                handleError(error, resRef);
            }
        }
    });
};

export const deleteUserHandler = async () => {
    try {
        const userId = getIdFromPath();
        if (!validateUUID(userId)) {
            throw new AppError(400, 'Invalid UUID format');
        }

        const deleted = await deleteUser(userId);
        if (!deleted) {
            throw new AppError(404, 'User not found');
        }

        resRef.writeHead(204);
        resRef.end();
    } catch (error: any) {
        handleError(error, resRef);
    }
};

const getIdFromPath = (): string => {
    const url = parse(reqRef.url || '', true);
    const match = url.pathname?.match(/^\/api\/users\/([a-zA-Z0-9-]+)$/);
    return match?.[1] || '';
};

export const setReqRes = (req: IncomingMessage, res: ServerResponse) => {
    reqRef = req;
    resRef = res;
};
