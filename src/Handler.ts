import { IncomingMessage, ServerResponse } from 'http';
import UsersDoc, { Statuses, Result, User } from './db/UsersDoc.js';
import parseId from './utils/parseId.js';
export default class {
	users: UsersDoc;
	route: string;
	constructor({ users, route }: { users: UsersDoc; route: string }) {
		this.users = users;
		this.route = route;
	}

	GET = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
		// res.setHeader('Content-Type', 'application/json');
		// const currentURL = new URL(
		// 	req.url || '/',
		// 	`http://${req.headers.host}`
		// );
		// const userId: string = parseId(this.route, currentURL.pathname);
		const result: User[] = this.users.getAll();
		res.statusCode = 200;
		res.end(JSON.stringify(result));
	};
	POST = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
		res.setHeader('Content-Type', 'application/json');
		const currentURL = new URL(
			req.url || '/',
			`http://${req.headers.host}`
		);
		const userId: string = parseId(this.route, currentURL.pathname);
		const body: string[] = [];
		req.on('data', (chunk) => body.push(chunk.toString())).on('end', () => {
			const result = this.users.create(JSON.parse(body.join()));
			res.statusCode = 200;
			res.end(JSON.stringify(result));
		});
	};
	PUT = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
		res.setHeader('Content-Type', 'application/json');
		const currentURL = new URL(
			req.url || '/',
			`http://${req.headers.host}`
		);
		const userId: string = parseId(this.route, currentURL.pathname);
		const body: string[] = [];
		req.on('data', (chunk) => body.push(chunk.toString())).on('end', () => {
			const result = this.users.updateById(
				userId,
				JSON.parse(body.join())
			);
			res.statusCode = 200;
			res.end(JSON.stringify(result));
		});
	};
	DELETE = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
		res.setHeader('Content-Type', 'application/json');
		const currentURL = new URL(
			req.url || '/',
			`http://${req.headers.host}`
		);
		const userId: string = parseId(this.route, currentURL.pathname);
		const result: Result = this.users.deleteById(userId);

		if (result.status === Statuses.DELETED) {
			res.statusCode = 200;
		} else {
			res.statusCode = 404;
		}

		res.end(JSON.stringify(result));
	};
}
