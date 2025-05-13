import request from 'supertest';
import server from '../app';
import { v4 as uuidv4 } from 'uuid';

describe('API Tests', () => {
  let userId: string;
  let nonExistentId: string;

  test('Scenario 1: Get all users', async () => {
    const response = await request(server).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Scenario 2: Create new user', async () => {
    const userData = {
      username: 'testuser',
      age: 25,
      email: 'test@example.com',
      hobbies: ['reading', 'coding'],
    };

    const response = await request(server).post('/api/users').send(userData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(userData.username);
    expect(response.body.age).toBe(userData.age);
    expect(response.body.email).toBe(userData.email);
    expect(response.body.hobbies).toEqual(userData.hobbies);

    userId = response.body.id;
  });

  test('Scenario 3: Get user by ID', async () => {
    const response = await request(server).get(`/api/users/${userId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
    expect(response.body.username).toBe('testuser');
  });

  test('Scenario 4: Update user', async () => {
    const updateData = {
      username: 'updateduser',
      age: 26,
      email: 'updated@example.com',
      hobbies: ['reading', 'coding', 'gaming'],
    };

    const response = await request(server).put(`/api/users/${userId}`).send(updateData);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', userId);
    expect(response.body.username).toBe(updateData.username);
    expect(response.body.age).toBe(updateData.age);
    expect(response.body.email).toBe(updateData.email);
    expect(response.body.hobbies).toEqual(updateData.hobbies);
  });

  test('Scenario 5: Delete user', async () => {
    const response = await request(server).delete(`/api/users/${userId}`);
    expect(response.status).toBe(204);
    nonExistentId = uuidv4();
    expect(nonExistentId).not.toBe(userId);
  });

  test('Scenario 6: Try to get deleted user (valid but non-existent UUID)', async () => {
    const response = await request(server).get(`/api/users/${nonExistentId}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found', status: 'error' });
  });

  test('Scenario 7: Try to update non-existent user (valid UUID)', async () => {
    const updateData = {
      username: 'nonexistent',
      age: 30,
      email: 'nonexistent@example.com',
      hobbies: ['none'],
    };

    const response = await request(server).put(`/api/users/${nonExistentId}`).send(updateData);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found', status: 'error' });
  });

  test('Scenario 8: Try to delete non-existent user (valid UUID)', async () => {
    const response = await request(server).delete(`/api/users/${nonExistentId}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found', status: 'error' });
  });

  test('Scenario 9: Invalid UUID format', async () => {
    const response = await request(server).get(`/api/users/invalid-uuid`);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid UUID format', status: 'error' });
  });
});
