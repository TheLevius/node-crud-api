import UsersCRUD, { Result, User, UserUpdates } from '../services/UsersCRUD.js';
import { IPCMsgRequest } from '../services/UsersMsgCRUD.js';

export default class {
	private usersCRUD: UsersCRUD;
	constructor({ usersCRUD }) {
		this.usersCRUD = usersCRUD;
	}
	public msgHandler = (msg: IPCMsgRequest<IPCMessage>): Result =>
		this[msg.action](msg.payload);

	private findAll = (): Result => this.usersCRUD.getAll();
	private findOneById = (payload: Pick<IPCMessage, 'userId'>): Result =>
		this.usersCRUD.findOneById(payload.userId);
	private create = (payload: Pick<IPCMessage, 'userCreate'>): Result =>
		this.usersCRUD.create(payload.userCreate);
	private updateById = (payload: Omit<IPCMessage, 'userCreate'>): Result =>
		this.usersCRUD.updateById(payload.userId, payload.userUpdate);
	private deleteById = (payload: Pick<IPCMessage, 'userId'>): Result =>
		this.usersCRUD.deleteById(payload.userId);
}
export type IPCMessage = {
	userId: string;
	userCreate: Omit<User, 'id'>;
	userUpdate: UserUpdates;
};

export type IPCMsgActions =
	| 'findAll'
	| 'findOneById'
	| 'create'
	| 'updateById'
	| 'deleteById';
