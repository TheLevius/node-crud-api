import { ServerResponse } from 'node:http';
import { IncomingMessage } from 'node:http';

export default class {
	constructor() {}
	get = (route: string, controller: Handler) => {};
}

type Handler = (
	req: IncomingMessage,
	res: ServerResponse<IncomingMessage>
) => void;
