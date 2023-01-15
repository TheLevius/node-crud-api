import request from 'supertest';
import { server } from './index.js';
const route = '/api/users';
describe(route, () => {
	it('should return empty array', async () => {
		const response = await request(server).get(route);

		expect(response.status).toEqual(200);
		expect(response.body.users).toEqual([]);
	});
	it('should create new user', async () => {
		const response = await request(server)
			.post(route)
			.send({ username: 'Tester', age: 33, hobbies: ['cs'] })
			.set('Accept', 'application/json');
		expect(response.status).toEqual(201);
		expect(response.body.user.age).toEqual(33);
	});
	it('should update created user and update him', async () => {
		const createResponse = await request(server)
			.post(route)
			.send({ username: 'Tester', age: 33, hobbies: ['cs'] })
			.set('Accept', 'application/json');
		const newUser = createResponse.body.user;
		const updates = {
			username: 'Levius',
			age: 30,
			hobbies: ['computer science'],
		};
		const updateResponse = await request(server)
			.put(`${route}/${newUser.id}`)
			.send(updates)
			.set('Accept', 'application/json');

		expect(updateResponse.body.updated.username).toBe(updates.username);
	});
	afterAll(() => {
		server.close();
	});
});
