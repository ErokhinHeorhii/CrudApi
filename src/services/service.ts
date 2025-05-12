import { v4 as uuidv4 } from 'uuid';
import {User} from "../models/models.ts";

let users: User[] = [
    {
        id: uuidv4(),
        username: 'Alice',
        age: 25,
        email: 'alice@example.com',
        hobbies: ['reading', 'cycling', 'coding'],
    },
    {
        id: uuidv4(),
        username: 'Bob',
        age: 30,
        email: 'bob@example.com',
        hobbies: ['gaming', 'cooking'],
    },
    {
        id: uuidv4(),
        username: 'Charlie',
        age: 22,
        email: 'charlie@example.com',
        hobbies: ['drawing', 'traveling', 'music!!!'],
    },
];

export const getAllUsers = async (): Promise<User[]> => {
    return users;
};

export const getUserById = async (id: string): Promise<User | null> => {
    return users.find(user => user.id === id) || null;
};

export const createUser = async (data: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = { id: uuidv4(), ...data };
    users.push(newUser);
    return newUser;
};

export const updateUser = async (id: string, data: Omit<User, 'id'>): Promise<User | null> => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;

    users[index] = { id, ...data };
    return users[index];
};

export const deleteUser = async (id: string): Promise<boolean> => {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    return true;
};
