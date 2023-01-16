import cluster from 'node:cluster';
import http, { IncomingMessage, ServerResponse } from 'node:http';
import { hostname } from 'node:os';
import { cpus } from 'node:os';
import process from 'node:process';
import dotenv from 'dotenv';
import UsersCRUD from './services/UsersCRUD.js';
import ReceiveMsgController, {
	IPCMessage,
	IPCMsgActions,
} from './controllers/ReceiveMsgController.js';
import Validator from './services/Validator.js';
import Router from './router/Router.js';
import UsersMsgController from './controllers/UsersMsgController.js';
import UsersMsgCRUD, { IPCMsgRequest } from './services/UsersMsgCRUD.js';
dotenv.config();

const usersCRUD = new UsersCRUD([]);
const receiveMsgController = new ReceiveMsgController({ usersCRUD });

const basePort = Number(process.env.PORT);

const initRoundRobinGen: (max: number, min?: number) => () => number = (
	max,
	min = 0
) => {
	let current = min;
	return (): number => {
		if (current > max) {
			current = min;
		}
		return current++;
	};
};

if (cluster.isPrimary) {
	const basePid = process.pid;

	const numCPUs = cpus().length - 1;
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	const workerKeys = (cluster.workers && Object.keys(cluster.workers)) || [];

	for (const workerId of workerKeys) {
		cluster.workers?.[workerId]?.on(
			'message',
			(msg: IPCMsgRequest<IPCMessage>) => {
				cluster.workers?.[workerId]?.send({
					action: msg.action,
					result: receiveMsgController.msgHandler(msg),
				});
			}
		);
	}

	const getRoundRobinValue = initRoundRobinGen(workerKeys.length - 1);

	const balancer = (
		req: IncomingMessage,
		res: ServerResponse<IncomingMessage>
	) => {
		const roundRobinValue = getRoundRobinValue();
		const options = {
			hostname: hostname(),
			port: basePort + parseInt(workerKeys[roundRobinValue]),
			path: req.url,
			method: req.method,
			headers: req.headers,
		};
		const request = http.request(options, (response) => {
			const body: Buffer[] = [];
			response
				.on('data', (chunk: Buffer) => {
					body.push(chunk);
				})
				.on('end', () => {
					res.setHeader(
						'Content-Type',
						response.headers?.['Content-Type'] ?? 'text/plain'
					);
					res.write(body.join().toString());
					res.end();
				});
		});

		const body: Buffer[] = [];
		req.on('data', (chunk: Buffer) => {
			body.push(chunk);
		}).on('end', () => {
			request.write(body.join().toString());
			request.end();
		});
	};

	const loadBalanceServer = http.createServer(balancer);
	loadBalanceServer.listen(basePort, () => {
		console.log(`Master listening on port ${basePort} and pid ${basePid}`);
	});
} else {
	const workerId = Number(cluster.worker?.id);
	const workerPort = basePort + workerId;

	const usersMsgController = new UsersMsgController({
		usersMsgCRUD: new UsersMsgCRUD(),
		validator: new Validator(),
		workerId,
	});
	const apiRouter = new Router();

	apiRouter.get('/api/users', usersMsgController.getAll);
	apiRouter.get('/api/users/:id', usersMsgController.getOneById);
	apiRouter.post('/api/users', usersMsgController.createUser);
	apiRouter.put('/api/users/:id', usersMsgController.updateById);
	apiRouter.delete('/api/users/:id', usersMsgController.deleteById);

	const workerServer = http.createServer(apiRouter.requestHandler);

	workerServer.listen(workerPort, () => {
		console.log(
			`Worker listening on port ${workerPort} and pid ${cluster.worker?.process.pid}`
		);
	});
}
