import request from 'supertest';
import { server as app } from './index.js';
const route = '/api/users';
const server = request(app);
describe(`${route} CRUD normal`, () => {
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

describe(`${route}/ Operations with not exact path (slashed)`, () => {
	const newUser = {
		username: 'Tester',
		age: 30,
		hobbies: ['Computer Science'],
	};
	it(`GET should return user with slashed/not exact route`, async () => {
		const userCreatedResponse = await server.post(route).send(newUser);
		const { user } = userCreatedResponse.body;
		const response = await server.get(`${route}/${user.id}/`);
		expect(response.status).toBe(200);
		expect(response.body.user).toMatchObject(user);
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
	// it(`GET should return bad request with 404`, async () => {
	// 	const userCreatedResponse = await server.post(route).send(newUser);
	// 	const {} = userCreatedResponse.body;
	// 	const response = await server.get(route);
	// 	server.get('');
	// 	expect(2).toBe(2);
	// });
	// it(`GET should return bad request with 404`, async () => {
	// 	const userCreatedResponse = await server.post(route).send(newUser);
	// 	const {} = userCreatedResponse.body;
	// 	server.get('')
	// 	expect(2).toBe(2);
	// });
});

describe(`${route} operations with incorrect path`, () => {
	it('simple', () => {
		expect(2).toBe(2);
	});
});
app.close();
