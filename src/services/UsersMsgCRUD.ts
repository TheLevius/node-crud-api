import {
	IPCMessage,
	IPCMsgActions,
} from '../controllers/ReceiveMsgController.js';
import { Result } from './UsersCRUD.js';
export default class {
	constructor() {}
	public findAll = async (): Promise<Result> => {
		const msgRequest: IPCMsgRequest<null> = {
			action: 'findAll',
			payload: null,
		};
		return this.receiver(msgRequest);
	};
	public findOneById = async (id: string): Promise<Result> => {
		const msgRequest: IPCMsgRequest<Pick<IPCMessage, 'userId'>> = {
			action: 'findOneById',
			payload: {
				userId: id,
			},
		};
		return this.receiver(msgRequest);
	};
	public deleteById = async (id: string): Promise<Result> => {
		const msgRequest: IPCMsgRequest<Pick<IPCMessage, 'userId'>> = {
			action: 'deleteById',
			payload: {
				userId: id,
			},
		};
		return this.receiver(msgRequest);
	};
	public updateById = async (
		id: string,
		updates: UserUpdates
	): Promise<Result> => {
		const msgRequest: IPCMsgRequest<Omit<IPCMessage, 'userCreate'>> = {
			action: 'updateById',
			payload: {
				userUpdate: updates,
				userId: id,
			},
		};
		return this.receiver(msgRequest);
	};
	public create = async (user: Omit<User, 'id'>): Promise<Result> => {
		const msgRequest: IPCMsgRequest<Pick<IPCMessage, 'userCreate'>> = {
			action: 'create',
			payload: {
				userCreate: user,
			},
		};
		return this.receiver(msgRequest);
	};
	private receiver = async (
		msgRequest: IPCMsgRequest<Partial<IPCMessage> | null>
	): Promise<Result> => {
		const result: Promise<Result> = new Promise((resolve) => {
			process.on('message', (msg: IPCMsgResponse) => {
				if (msg.action === msgRequest.action) {
					resolve(msg.result);
				}
			});
		});
		process.send && process.send(msgRequest);
		return result;
	};
}

export type IPCMsgResponse = {
	action: IPCMsgActions;
	result: Result;
};
export type IPCMsgRequest<T> = {
	action: IPCMsgActions;
	payload: T;
};

export type User = {
	id: string;
	username: string;
	age: number;
	hobbies: string[];
};

export type UserUpdates = Omit<Partial<User>, 'id'>;
