import {
    getAllUsersHandler,
    getUserByIdHandler,
    createUserHandler,
    updateUserHandler,
    deleteUserHandler
} from '../controllers/controller.ts';

export const userRoutes: Record<string, () => void> = {
    'GET:/api/users': getAllUsersHandler,
    'GET:/api/users/:id': getUserByIdHandler,
    'POST:/api/users': createUserHandler,
    'PUT:/api/users/:id': updateUserHandler,
    'DELETE:/api/users/:id': deleteUserHandler
};
