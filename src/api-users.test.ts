import request from 'supertest';
import { server as app } from './index.js';
const route = '/api/users';

describe(`${route} testing without IPC`, () => {
	const server = request(app);
	const newUser = {
		username: 'Tester',
		age: 30,
		hobbies: ['Computer Science'],
	};

	it('GET first request after start server should return empty array', async () => {
		const response = await server.get(route);
		expect(response.status).toBe(200);
		expect(response.body.users).toEqual([]);
	});

	it('POST should create new user', async () => {
		const response = await server.post(route).send(newUser);
		expect(response.status).toBe(201);
		expect(response.body.user).toMatchObject(newUser);
	});

	it('GET should return user by id', async () => {
		const response = await server.post(route).send(newUser);
		const receivedUser = response.body.user;
		const findOneByIdResponse = await server.get(
			`${route}/${receivedUser.id}`
		);
		expect(findOneByIdResponse.status).toBe(200);
		expect(findOneByIdResponse.body.user).toMatchObject(receivedUser);
	});

	it('PUT should update created user', async () => {
		const response = await server.post(route).send(newUser);
		const receivedUser = response.body.user;
		const userUpdates = {
			username: 'UpdatedUserName',
			age: 25,
			hobbies: ['Software Development'],
		};
		const updateResponse = await server
			.put(`${route}/${receivedUser.id}`)
			.send(userUpdates);
		expect(updateResponse.body.updated.id).toBe(receivedUser.id);
		expect(updateResponse.body.updated).toMatchObject(userUpdates);
	});

	it('DELETE should delete user by id', async () => {
		const response = await server.post(route).send(newUser);
		const receivedUser = response.body.user;
		const deleteByIdResponse = await server.delete(
			`${route}/${receivedUser.id}`
		);
		expect(deleteByIdResponse.status).toBe(204);
		const findDeletedByIdResponse = await server.get(
			`${route}/${receivedUser.id}`
		);
	});

	app.close();
});
