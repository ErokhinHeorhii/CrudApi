import { createServer } from 'http';
import {handleUserRequest} from "./controllers/controller.ts";

const server = createServer((req, res) => {
  if (req.url?.startsWith('/api/users')) {
    handleUserRequest(req, res);
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

export default server;
