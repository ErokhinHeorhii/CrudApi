import {IncomingMessage, ServerResponse} from 'http';
import {parse} from 'url';
import {validateUserData, validateUUID} from '../utils/validate.ts';
import {createUser, deleteUser, getAllUsers, getUserById, updateUser} from "../services/service.ts";

export const handleUserRequest = async (req: IncomingMessage, res: ServerResponse) => {
    const url = parse(req.url || '', true);
    const method = req.method;
    const idMatch = url.pathname?.match(/^\/api\/users\/([a-zA-Z0-9-]+)$/);
    const isCollection = url.pathname === '/api/users';

    if (method === 'GET' && isCollection) {
        const users = await getAllUsers();
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(users));
        return;
    }

    if (method === 'GET' && idMatch) {
        const userId = idMatch[1];
        if (!validateUUID(userId)) {
            res.writeHead(400);
            res.end(JSON.stringify({message: 'Invalid UUID'}));
            return;
        }

        const user = await getUserById(userId);
        if (!user) {
            res.writeHead(404);
            res.end(JSON.stringify({message: 'User not found'}));
            return;
        }

        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(user));
        return;
    }
    if (method === 'POST' && isCollection) {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const {username, age, email, hobbies} = data;

                if (
                    !validateUserData(data)
                ) {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({message: 'Invalid user data'}));
                    return;
                }

                const newUser = await createUser({username, age, email, hobbies});

                res.writeHead(201, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(newUser));
            } catch {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: 'Invalid JSON format'}));
            }
        });

        return;
    }
    if (method === 'PUT' && idMatch) {
        const userId = idMatch[1];
        if (!validateUUID(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid UUID' }));
            return;
        }

        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                if (!validateUserData(data)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Invalid user data' }));
                    return;
                }

                const updated = await updateUser(userId, data);
                if (!updated) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'User not found' }));
                    return;
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updated));
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON format' }));
            }
        });
        return;
    }
    if (method === 'DELETE' && idMatch) {
        const userId = idMatch[1];

        if (!validateUUID(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid UUID' }));
            return;
        }

        const success = await deleteUser(userId);
        if (!success) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
            return;
        }

        res.writeHead(204);
        res.end();
        return;
    }
};
