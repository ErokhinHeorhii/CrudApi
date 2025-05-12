import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { userRoutes } from '../routes/routes.ts';
import { setReqRes } from './controller.ts';

export const handleUserRequest = async (req: IncomingMessage, res: ServerResponse) => {
    const url = parse(req.url || '', true);
    const pathname = url.pathname || '';
    const method = req.method || '';

    const idMatch = pathname.match(/^\/api\/users\/([a-zA-Z0-9-]+)$/);
    const routeKey = idMatch ? `${method}:/api/users/:id` : `${method}:${pathname}`;

    const handler = userRoutes[routeKey];

    setReqRes(req, res);

    if (handler) {
        await handler();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
};
