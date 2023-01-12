import { IncomingMessage, ServerResponse } from 'node:http';
import UsersCRUD, {
	Statuses as UsersCRUDStatuses,
	User,
} from '../services/UsersCRUD.js';
import Validator, { Prop } from '../services/Validator.js';

const statusCodeDict: StatusCodeDict = {
	OK: 200,
	[UsersCRUDStatuses.CREATED]: 200,
	[UsersCRUDStatuses.UPDATED]: 200,
	[UsersCRUDStatuses.DELETED]: 200,
	[UsersCRUDStatuses.NOT_FOUND]: 404,
	BAD_REQUEST: 400,
	ERROR: 400,
};

export default class {
	usersCRUD: UsersCRUD;
	validator: Validator;
	statusCodeDict: StatusCodeDict;
	constructor({
		usersCRUD,
		validator,
	}: {
		usersCRUD: UsersCRUD;
		validator: Validator;
	}) {
		this.usersCRUD = usersCRUD;
		this.validator = validator;
		this.statusCodeDict = statusCodeDict;
	}
	getAll = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
		const result = this.usersCRUD.getAll();
		res.statusCode = this.statusCodeDict[result.status];
		res.end(JSON.stringify(result));
	};

	getOneById = (
		req: IncomingMessage & Params,
		res: ServerResponse<IncomingMessage & Params>
	) => {
		const userId = req.params.id;
		const validateResult = this.validator.validate(
			{ id: userId },
			idCheckSchema
		);
		if (validateResult.status === 'OK') {
			const result = this.usersCRUD.findOneById(userId);
			res.statusCode = this.statusCodeDict[result.status];
			res.end(JSON.stringify(result));
		} else {
			res.statusCode = this.statusCodeDict[validateResult.status];
			res.end(JSON.stringify(validateResult));
		}
	};
	createUser = (
		req: IncomingMessage,
		res: ServerResponse<IncomingMessage>
	) => {
		const body: string[] = [];
		req.on('data', (chunk) => body.push(chunk.toString())).on('end', () => {
			const payload: Omit<User, 'id'> = JSON.parse(body.join());
			const validateResult = this.validator.validate(
				payload,
				createUserSchema
			);
			if (validateResult.status === 'OK') {
				const result = this.usersCRUD.create(payload);
				res.statusCode = this.statusCodeDict[result.status];
				res.end(JSON.stringify(result));
			} else {
				res.statusCode = this.statusCodeDict[validateResult.status];
				res.end(JSON.stringify(validateResult));
			}
		});
	};
	updateById = (
		req: IncomingMessage & Params,
		res: ServerResponse<IncomingMessage & Params>
	) => {
		const userId = req.params.id;
		const body: string[] = [];
		req.on('data', (chunk) => body.push(chunk.toString())).on('end', () => {
			const payload = JSON.parse(body.join());
			const validateResult = this.validator.validate(
				{
					...payload,
					id: userId,
				},
				updateUserSchema
			);
			if (validateResult.status === 'OK') {
				const result = this.usersCRUD.updateById(userId, payload);
				res.statusCode = this.statusCodeDict[result.status];
				res.end(JSON.stringify(result));
			} else {
				res.statusCode = this.statusCodeDict[validateResult.status];
				res.end(JSON.stringify(validateResult));
			}
		});
	};
	deleteById = (
		req: IncomingMessage & Params,
		res: ServerResponse<IncomingMessage & Params>
	) => {
		const userId = req.params.id;
		const validateResult = this.validator.validate(
			{ id: userId },
			idCheckSchema
		);
		if (validateResult.status === 'OK') {
			const result = this.usersCRUD.deleteById(userId);
			res.statusCode = this.statusCodeDict[result.status];
			res.end(JSON.stringify(result));
		} else {
			res.statusCode = this.statusCodeDict[validateResult.status];
			res.end(JSON.stringify(validateResult));
		}
	};
}

const idCheckSchema: Prop[] = [
	{
		key: 'id',
		checks: ['required', 'properType', 'isProperId'],
		expectTypes: ['string'],
	},
];
const createUserSchema: Prop[] = [
	{
		key: 'username',
		checks: ['properType'],
		expectTypes: ['string'],
	},
	{
		key: 'age',
		checks: ['properType'],
		expectTypes: ['number'],
	},
	{
		key: 'hobbies',
		checks: ['properType', 'isArrayOf'],
		expectTypes: ['array'],
		expectArrayOf: ['string'],
	},
];
const updateUserSchema: Prop[] = [
	{
		key: 'id',
		checks: ['properType', 'isProperId'],
		expectTypes: ['string'],
	},
	{
		key: 'username',
		checks: ['properType'],
		expectTypes: ['string'],
	},
	{
		key: 'age',
		checks: ['properType'],
		expectTypes: ['number'],
	},
	{
		key: 'hobbies',
		checks: ['properType', 'isArrayOf'],
		expectTypes: ['array'],
		expectArrayOf: ['string'],
	},
];
type StatusCodeDict = {
	[key: string]: 200 | 400 | 404;
};
type Params = { params: { [key: string]: string } };
