import cluster from 'node:cluster';
import http, { IncomingMessage, ServerResponse } from 'node:http';
import { hostname } from 'node:os';
import { cpus } from 'node:os';
import process from 'node:process';
import dotenv from 'dotenv';
import UsersCRUD, { Result } from './services/UsersCRUD.js';
import MsgController from './controllers/MsgController.js';
import Validator from './services/Validator.js';
import Router from './router/Router.js';
import UsersMsgController from './controllers/UsersMsgController.js';
import UsersMsgCRUD from './services/UsersMsgCRUD.js';

dotenv.config();
const basePort = Number(process.env.PORT);
const basePid = process.pid;

const usersCRUD = new UsersCRUD([]);
const msgController = new MsgController({ usersCRUD });

const initRoundRobinGen = (max: number, min = 0): Function => {
	let current = min;
	return (): number => {
		if (current > max) {
			current = min;
		}
		return current++;
	};
};

if (cluster.isPrimary) {
	const numCPUs = cpus().length - 1;
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	const workerKeys = (cluster.workers && Object.keys(cluster.workers)) || [];

	for (const workerId of workerKeys) {
		cluster.workers?.[workerId]?.on('message', (msg) => {
			cluster.workers?.[workerId]?.send(msgController.msgHandler(msg));
		});
	}

	const getRoundRobinValue = initRoundRobinGen(workerKeys.length - 1, 0);

	const balancer = (
		req: IncomingMessage,
		res: ServerResponse<IncomingMessage>
	) => {
		const roundRobinValue = getRoundRobinValue();
		const options = {
			hostname: hostname(),
			port: basePort + roundRobinValue,
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
	const workerId = Number(cluster.worker?.id) ?? 0;
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

	const dispatcher = async (req, res) => {
		const msgReceiver: Promise<Result> = new Promise((resolve) => {
			process.on('message', (msg: Result) => {
				resolve(msg);
			});
		});
		process?.send && process.send({ action: 'getAll' });
		const result: Result & { workerId?: number } = await msgReceiver;
		result.workerId = workerId;
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Process-id', '' + process.pid);
		res.writeHead(200);
		res.end(JSON.stringify(result));
	};

	const workerServer = http.createServer(apiRouter.requestHandler);

	workerServer.listen(workerPort, () => {
		console.log(
			`Worker listening on port ${workerPort} and pid ${cluster.worker?.process.pid}`
		);
	});
}
