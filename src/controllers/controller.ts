import { IncomingMessage, ServerResponse } from 'http';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../services/service.ts';
import { validateUUID, validateUserData } from '../utils/validate.ts';
import { parse } from 'url';

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
    const users = await getAllUsers();
    send(200, users);
};

export const getUserByIdHandler = async () => {
    const userId = getIdFromPath();
    if (!validateUUID(userId)) return send(400, { message: 'Invalid UUID' });

    const user = await getUserById(userId);
    if (!user) return send(404, { message: 'User not found' });

    send(200, user);
};

export const createUserHandler = () => {
    handleBody(reqRef, async body => {
        try {
            const data = JSON.parse(body);
            if (!validateUserData(data)) return send(400, { message: 'Invalid user data' });

            const user = await createUser(data);
            send(201, user);
        } catch {
            send(400, { message: 'Invalid JSON format' });
        }
    });
};

export const updateUserHandler = () => {
    const userId = getIdFromPath();
    if (!validateUUID(userId)) return send(400, { message: 'Invalid UUID' });

    handleBody(reqRef, async body => {
        try {
            const data = JSON.parse(body);
            if (!validateUserData(data)) return send(400, { message: 'Invalid user data' });

            const updated = await updateUser(userId, data);
            if (!updated) return send(404, { message: 'User not found' });

            send(200, updated);
        } catch {
            send(400, { message: 'Invalid JSON format' });
        }
    });
};

export const deleteUserHandler = async () => {
    const userId = getIdFromPath();
    if (!validateUUID(userId)) return send(400, { message: 'Invalid UUID' });

    const deleted = await deleteUser(userId);
    if (!deleted) return send(404, { message: 'User not found' });

    resRef.writeHead(204);
    resRef.end();
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
