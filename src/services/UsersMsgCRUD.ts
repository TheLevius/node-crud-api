import { IPCMessage } from '../controllers/ReceiveMsgController.js';
import { Result, Statuses } from './UsersCRUD.js';
export default class {
	constructor() {}
	getAll = async (): Promise<Result> => {
		process.send && process.send({ action: 'getAll' });
		return new Promise((resolve) => {
			process.on('message', (msg: Result) => {
				if (msg.action === 'getAll') {
					const { action, ...readyMsg } = msg;
					resolve(readyMsg);
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
					const { action, ...readyMsg } = msg;
					resolve(readyMsg);
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
					const { action, ...readyMsg } = msg;
					resolve(readyMsg);
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
					const { action, ...readyMsg } = msg;
					resolve(readyMsg);
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
					const { action, ...readyMsg } = msg;
					resolve(readyMsg);
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
