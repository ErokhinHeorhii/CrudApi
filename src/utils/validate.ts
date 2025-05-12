import { validate as isUUID } from 'uuid';
import {User} from "../models/models.ts";

export function validateUUID(id: string): boolean {
    return isUUID(id);
}

export function validateUserData(data: Partial<Omit<User, 'id'>>): boolean {
    const { username, age, email, hobbies } = data;
    return (
        typeof username === 'string' &&
        typeof age === 'number' &&
        typeof email === 'string' &&
        Array.isArray(hobbies)
    );
}
