import { IPCMessage } from '../controllers/MsgController.js';
import { Result, Statuses } from './UsersCRUD.js';
export default class {
	constructor() {}
	getAll = async (): Promise<Result> => {
		process.send && process.send({ action: 'getAll' });
		return new Promise((resolve) => {
			process.on('message', (msg: Result) => {
				if (msg.action === 'getAll') {
					delete msg.action;
					resolve(msg);
				}
			});
		});
	};
	findOneById = async (id: string): Promise<Result> => {
		const findUser: Pick<IPCMessage, 'userId' & 'action'> = {
			userId: id,
			action: 'getOneById',
		};
		process.send && process.send(findUser);
		return new Promise((resolve) => {
			process.on('message', (msg: Result) => {
				if (msg.action === 'getOneById') {
					resolve(msg);
				}
			});
		});
	};
	deleteById = async (id: string): Promise<Result> => {
		const deleteUser: Pick<IPCMessage, 'userId' & 'action'> = {
			userId: id,
			action: 'deleteById',
		};
		process.send && process.send(deleteUser);
		return new Promise((resolve) => {
			process.on('message', (msg: Result) => {
				if (msg.action === 'deleteById') {
					resolve(msg);
				}
			});
		});
	};
	updateById = async (id: string, updates: UserUpdates): Promise<Result> => {
		const userUpdate: Omit<IPCMessage, 'userCreate'> = {
			userUpdate: updates,
			userId: id,
			action: 'updateById',
		};
		process.send && process.send(userUpdate);
		return new Promise((resolve) => {
			process.on('message', (msg: Result) => {
				if (msg.action === 'updateById') {
					resolve(msg);
				}
			});
		});
	};
	create = async (user: Omit<User, 'id'>): Promise<Result> => {
		const newUser: Pick<IPCMessage, 'action' & 'userCreate'> = {
			userCreate: user,
			action: 'create',
		};
		process.send && process.send(newUser);
		return new Promise((resolve) => {
			process.on('message', (msg: Result) => {
				if (msg.action === 'create') {
					resolve(msg);
				}
			});
		});
	};
}

export type User = {
	id: string;
	username: string;
	age: number;
	hobbies: string[];
};

export type UserUpdates = Omit<Partial<User>, 'id'>;
