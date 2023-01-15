import { v4 } from 'uuid';
import { IPCMsgActions } from '../controllers/MsgController.js';
export default class {
	users: User[];
	constructor(users: User[]) {
		this.users = users ?? [];
	}
	getAll = (): Result => ({
		users: this.users,
		status: Statuses.OK,
	});
	findOneById = (id: string): Result => {
		const result: Result = {
			status: Statuses.NOT_FOUND,
		};
		this.users.findIndex((user) => {
			if (user.id === id) {
				result.user = user;
				result.status = Statuses.OK;
				return true;
			}
			return false;
		});
		return result;
	};
	deleteById = (id: string): Result => {
		const result: Result = {
			status: Statuses.NOT_FOUND,
		};
		this.users = this.users.filter((user) => {
			if (user.id === id) {
				result.deleted = JSON.parse(JSON.stringify(user));
				result.status = Statuses.DELETED;
				return false;
			}
			return true;
		});

		return result;
	};
	updateById = (id: string, updates: UserUpdates): Result => {
		const result: Result = {
			status: Statuses.INIT,
		};
		const index = this.users.findIndex((u) => {
			if (u.id === id) {
				result.before = JSON.parse(JSON.stringify(u));
				return true;
			}
			return false;
		});
		if (index === -1) {
			result.status = Statuses.NOT_FOUND;
		}
		this.users[index] = { ...this.users[index], ...updates };
		result.updated = this.users[index];
		result.status = Statuses.OK;

		return result;
	};
	create = (user: Omit<User, 'id'>): Result => {
		const newUser: User = { ...user, id: v4() };
		this.users.push(newUser);

		return {
			user: newUser,
			status: Statuses.CREATED,
		};
	};
}

export type User = {
	id: string;
	username: string;
	age: number;
	hobbies: string[];
};

export type UserUpdates = Omit<Partial<User>, 'id'>;

export const enum Statuses {
	INIT = 'INIT',
	CREATED = 'CREATED',
	DELETED = 'DELETED',
	UPDATED = 'UPDATED',
	NOT_FOUND = 'NOT_FOUND',
	OK = 'OK',
}

export type Result = {
	status: Statuses;
	users?: User[];
	user?: User;
	before?: User;
	updated?: User;
	deleted?: User;
	action?: IPCMsgActions;
};
