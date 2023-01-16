import { IncomingMessage, ServerResponse } from 'node:http';
import {
	Result,
	Statuses as UsersCRUDStatuses,
	User,
} from '../services/UsersCRUD.js';
import UsersMsgCRUD from '../services/UsersMsgCRUD.js';
import Validator, { Prop } from '../services/Validator.js';
import {
	createUserSchema,
	idCheckSchema,
	updateUserSchema,
} from './UsersController.js';

const statusCodeDict: StatusCodeDict = {
	OK: 200,
	[UsersCRUDStatuses.CREATED]: 201,
	[UsersCRUDStatuses.UPDATED]: 200,
	[UsersCRUDStatuses.DELETED]: 204,
	[UsersCRUDStatuses.NOT_FOUND]: 404,
	BAD_REQUEST: 400,
	ERROR: 400,
};

export default class {
	usersMsgCRUD: UsersMsgCRUD;
	validator: Validator;
	statusCodeDict: StatusCodeDict;
	workerId: number;
	constructor({
		usersMsgCRUD,
		validator,
		workerId,
	}: {
		usersMsgCRUD: UsersMsgCRUD;
		validator: Validator;
		workerId: number;
	}) {
		this.usersMsgCRUD = usersMsgCRUD;
		this.validator = validator;
		this.statusCodeDict = statusCodeDict;
		this.workerId = workerId;
	}
	public findAll = async (
		req: IncomingMessage,
		res: ServerResponse<IncomingMessage>
	) => {
		const result: Result = await this.usersMsgCRUD.findAll();
		result.workerId = this.workerId;
		res.statusCode = this.statusCodeDict[result.status];
		res.end(JSON.stringify(result));
	};

	public findOneById = async (
		req: IncomingMessage & Params,
		res: ServerResponse<IncomingMessage & Params>
	) => {
		const userId = req.params.id;
		const validateResult = this.validator.validate(
			{ id: userId },
			idCheckSchema
		);
		if (validateResult.status === 'OK') {
			const result = await this.usersMsgCRUD.findOneById(userId);
			result.workerId = this.workerId;
			res.statusCode = this.statusCodeDict[result.status];
			res.end(JSON.stringify(result));
		} else {
			res.statusCode = this.statusCodeDict[validateResult.status];
			res.end(JSON.stringify(validateResult));
		}
	};
	public create = async (
		req: IncomingMessage,
		res: ServerResponse<IncomingMessage>
	) => {
		const body: string[] = [];
		req.on('data', (chunk) => body.push(chunk.toString())).on(
			'end',
			async () => {
				const payload: Omit<User, 'id'> = JSON.parse(body.join());
				const validateResult = this.validator.validate(
					payload,
					createUserSchema
				);
				if (validateResult.status === 'OK') {
					const result = await this.usersMsgCRUD.create(payload);
					result.workerId = this.workerId;
					res.statusCode = this.statusCodeDict[result.status];
					res.end(JSON.stringify(result));
				} else {
					res.statusCode = this.statusCodeDict[validateResult.status];
					res.end(JSON.stringify(validateResult));
				}
			}
		);
	};
	public updateById = async (
		req: IncomingMessage & Params,
		res: ServerResponse<IncomingMessage & Params>
	) => {
		const userId = req.params.id;
		const body: string[] = [];
		req.on('data', (chunk) => body.push(chunk.toString())).on(
			'end',
			async () => {
				const payload = JSON.parse(body.join());
				const validateResult = this.validator.validate(
					{
						...payload,
						id: userId,
					},
					updateUserSchema
				);
				if (validateResult.status === 'OK') {
					const result = await this.usersMsgCRUD.updateById(
						userId,
						payload
					);
					result.workerId = this.workerId;
					res.statusCode = this.statusCodeDict[result.status];
					res.end(JSON.stringify(result));
				} else {
					res.statusCode = this.statusCodeDict[validateResult.status];
					res.end(JSON.stringify(validateResult));
				}
			}
		);
	};
	public deleteById = async (
		req: IncomingMessage & Params,
		res: ServerResponse<IncomingMessage & Params>
	) => {
		const userId = req.params.id;
		const validateResult = this.validator.validate(
			{ id: userId },
			idCheckSchema
		);
		if (validateResult.status === 'OK') {
			const result = await this.usersMsgCRUD.deleteById(userId);
			result.workerId = this.workerId;
			res.statusCode = this.statusCodeDict[result.status];
			res.end(JSON.stringify(result));
		} else {
			res.statusCode = this.statusCodeDict[validateResult.status];
			res.end(JSON.stringify(validateResult));
		}
	};
}

type StatusCodeDict = {
	[key: string]: 200 | 201 | 204 | 400 | 404;
};
type Params = { params: { [key: string]: string } };
