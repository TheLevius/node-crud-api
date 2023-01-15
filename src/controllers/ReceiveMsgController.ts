import UsersCRUD, { Result, User, UserUpdates } from '../services/UsersCRUD.js';

export default class {
	private usersCRUD: UsersCRUD;
	constructor({ usersCRUD }) {
		this.usersCRUD = usersCRUD;
	}
	public msgHandler = (msg: IPCMessage): Result => {
		return this[msg.action](msg);
	};
	private getAll = (msg: IPCMessage): Result => ({
		action: msg.action,
		...this.usersCRUD.getAll(),
	});
	private getOneById = (msg: IPCMessage): Result => ({
		action: msg.action,
		...this.usersCRUD.findOneById(msg.userId),
	});
	private create = (msg: Omit<IPCMessage, 'userUpdate'>): Result => ({
		action: msg.action,
		...this.usersCRUD.create(msg?.userCreate),
	});

	private updateById = (msg: Omit<IPCMessage, 'userCreate'>): Result => ({
		action: msg.action,
		...this.usersCRUD.updateById(msg.userId, msg.userUpdate),
	});
	private deleteById = (
		msg: Omit<IPCMessage, 'userUpdate' | 'userCreate'>
	): Result => ({
		action: msg.action,
		...this.usersCRUD.deleteById(msg.userId),
	});
}

export type IPCMessage = {
	action: IPCMsgActions;
	userId: string;
	userCreate: Omit<User, 'id'>;
	userUpdate: UserUpdates;
};

export type IPCMsgActions =
	| 'getAll'
	| 'getOneById'
	| 'create'
	| 'updateById'
	| 'deleteById';
