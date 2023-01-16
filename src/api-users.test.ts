import request from 'supertest';
import { server as app } from './index.js';
const route = '/api/users';
const server = request(app);

const newUser = {
	username: 'Tester',
	age: 30,
	hobbies: ['Computer Science'],
};

describe(`${route} CRUD normal`, () => {
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
		const findDeletedByIdResponse = await server.delete(
			`${route}/${receivedUser.id}`
		);
		expect(findDeletedByIdResponse.status).toBe(404);
		const NotUuidDeleteByIdResponse = await server.delete(
			`${route}/id-w342-dfsdf-323`
		);
		expect(NotUuidDeleteByIdResponse.status).toBe(400);
	});
});

describe(`${route}/ Operations with not exact(slashed) and incorrect path `, () => {
	it(`GET should return user with slashed/not exact route`, async () => {
		const userCreatedResponse = await server.post(route).send(newUser);
		const { user } = userCreatedResponse.body;
		const response = await server.get(`${route}/${user.id}/`);
		expect(response.status).toBe(200);
		expect(response.body.user).toMatchObject(user);
	});
	it(`GET Should return error of validation if path is not uuid`, async () => {
		const userCreatedResponse = await server
			.post(`${route}/`)
			.send(newUser);
		expect(userCreatedResponse.status).toBe(201);
		const { user } = userCreatedResponse.body;
		const getUserResponse = await server.get(
			`${route}/${user.id}-some-trash-hash`
		);
		expect(getUserResponse.status).toBe(400);
	});
	it(`GET Should return Not Found 404 if Uuid is correct but with unnecessary params`, async () => {
		const userCreatedResponse = await server
			.post(`${route}/`)
			.send(newUser);
		expect(userCreatedResponse.status).toBe(201);
		const { user } = userCreatedResponse.body;
		const getUserResponse = await server.get(
			`${route}/${user.id}/some/unnecessary`
		);
		expect(getUserResponse.status).toBe(404);
	});
	it(`POST Should return Not Found 404 with correct Uuid in path (Wrong Method)`, async () => {
		const userCreatedResponse = await server
			.post(`${route}/`)
			.send(newUser);
		expect(userCreatedResponse.status).toBe(201);
		const { user } = userCreatedResponse.body;
		const getUserResponse = await server.get(`${route}/${user.id}`);
		expect(getUserResponse.status).toBe(200);
		const postUserResponse = await server.post(`${route}/${user.id}`).send({
			...newUser,
			username: 'SomethingNew',
		});
		expect(postUserResponse.status).toBe(404);
	});
	it(`POST should create user with slashed/not exact route`, async () => {
		const userCreatedResponse = await server
			.post(`${route}/`)
			.send(newUser);
		expect(userCreatedResponse.status).toBe(201);
		const { user } = userCreatedResponse.body;
		const findCreatedUserResponse = await server.get(
			`${route}/${user.id}/`
		);
		expect(findCreatedUserResponse.status).toBe(200);
		expect(findCreatedUserResponse.body.user).toMatchObject(user);
	});
	it('PUT should update user with slashed/not exact route', async () => {
		const userCreatedResponse = await server
			.post(`${route}/`)
			.send(newUser);
		expect(userCreatedResponse.status).toBe(201);
		const { user } = userCreatedResponse.body;
		const userUpdate = {
			username: 'SuperUpdateTester',
		};
		const updateCreatedUserResponse = await server
			.put(`${route}/${user.id}/`)
			.send(userUpdate);
		expect(updateCreatedUserResponse.status).toBe(200);
		expect(updateCreatedUserResponse.body.updated.username).toBe(
			userUpdate.username
		);
	});
	it(`PUT Should return 400 with correct payload but wrong uuid`, async () => {
		const userCreatedResponse = await server
			.post(`${route}/`)
			.send(newUser);
		expect(userCreatedResponse.status).toBe(201);
		const { user } = userCreatedResponse.body;
		const postUserResponse = await server
			.put(`${route}/${user.id}-df45-12`)
			.send({
				age: 25,
				username: 'CorrectPayload',
			});
		expect(postUserResponse.status).toBe(400);
	});
	it('DELETE should delete user with slashed/not exact route', async () => {
		const userCreatedResponse = await server
			.post(`${route}/`)
			.send(newUser);
		expect(userCreatedResponse.status).toBe(201);
		const { user } = userCreatedResponse.body;
		const deletedUserResponse = await server.delete(`${route}/${user.id}/`);
		expect(deletedUserResponse.status).toBe(204);
		const repeatDeleteUserResponse = await server.delete(
			`${route}/${user.id}/`
		);
		expect(repeatDeleteUserResponse.status).toBe(404);
	});
	it(`DELETE Should return 400 with wrong uuid`, async () => {
		const userCreatedResponse = await server
			.post(`${route}/`)
			.send(newUser);
		expect(userCreatedResponse.status).toBe(201);
		const { user } = userCreatedResponse.body;
		const postUserResponse = await server.delete(
			`${route}/${user.id}-df45-12`
		);
		expect(postUserResponse.status).toBe(400);
	});
});

describe(`${route} Operations with incorrect path and body`, () => {
	it(`POST Should return 400 Bad Request with incorrect body`, async () => {
		const userCreatedResponse = await server.post(`${route}`).send({
			age: '33',
		});
		expect(userCreatedResponse.status).toBe(400);
	});
});
app.close();
