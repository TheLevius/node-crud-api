import request from 'supertest';
import { server } from './index.js';
const route = '/api/users';
describe(route, () => {
	it('should return empty array', async () => {
		const response = await request(server).get(route);

		expect(response.status).toEqual(200);
		expect(response.body).toEqual([]);
	});
	it('should create new user', async () => {
		const response = await request(server)
			.post(route)
			.send({ username: 'Tester', age: 33, hobbies: ['cs'] })
			.set('Accept', 'application/json');
		expect(response.status).toEqual(200);
		expect(response.body.user.age).toEqual(33);
	});
});
