import { IncomingMessage, ServerResponse } from 'node:http';
import UsersCRUD, { Statuses } from '../services/UsersCRUD.js';

export default class {
	usersService: UsersCRUD;
	constructor({ usersService }: { usersService: UsersCRUD }) {
		this.usersService = usersService;
	}
	getAll = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
		res.setHeader('Content-Type', 'application/json');
		const result = this.usersService.getAll();
		res.statusCode = 200;
		res.end(JSON.stringify(result));
	};
	getOneById = (
		req: IncomingMessageWithParams,
		res: ServerResponse<IncomingMessageWithParams>
	) => {
		res.setHeader('Content-Type', 'application/json');
		const userId = req.params.id;
		const result = this.usersService.findOneById(userId);
		if (result.status === Statuses.OK) {
			res.statusCode = 200;
		} else {
			res.statusCode = 404;
		}
		res.end(JSON.stringify(result));
	};
	createUser = (
		req: IncomingMessage,
		res: ServerResponse<IncomingMessage>
	) => {
		res.setHeader('Content-Type', 'application/json');
		const body: string[] = [];
		req.on('data', (chunk) => body.push(chunk.toString())).on('end', () => {
			const result = this.usersService.create(JSON.parse(body.join()));
			res.statusCode = 200;
			res.end(JSON.stringify(result));
		});
	};
	updateById = (
		req: IncomingMessageWithParams,
		res: ServerResponse<IncomingMessageWithParams>
	) => {
		res.setHeader('Content-Type', 'application/json');
		const userId = req.params.id;
		const body: string[] = [];
		req.on('data', (chunk) => body.push(chunk.toString())).on('end', () => {
			const result = this.usersService.updateById(
				userId,
				JSON.parse(body.join())
			);
			if (result.status === Statuses.UPDATED) {
				res.statusCode = 200;
			} else {
				res.statusCode = 400;
			}

			res.end(JSON.stringify(result));
		});
	};
	deleteById = (
		req: IncomingMessageWithParams,
		res: ServerResponse<IncomingMessageWithParams>
	) => {
		res.setHeader('Content-Type', 'application/json');
		const userId = req.params.id;
		const result = this.usersService.deleteById(userId);

		if (result.status === Statuses.DELETED) {
			res.statusCode = 200;
		} else {
			res.statusCode = 400;
		}
		res.end(JSON.stringify(result));
	};
}

type Params = { params: { [key: string]: string } };
type IncomingMessageWithParams = IncomingMessage & Params;
