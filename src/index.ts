import http from 'node:http';
import { URL } from 'node:url';
import Handler from './Handler.js';
import UsersDoc from './db/UsersDoc.js';
const port = 3020;
const users = new UsersDoc({ users: [] });
const usersHandler = new Handler({ users, route: 'api/users' });

const server = http.createServer((req, res) => {
	const currentURL = new URL(req.url || '/', `http://${req.headers.host}`);
	if (req.url !== undefined && req.method !== undefined) {
		switch (currentURL.pathname) {
			case '/': {
				res.statusCode = 200;
				res.end('Welcome to server');
				break;
			}
			case '/api/users': {
				usersHandler[req.method](req, res);
				break;
			}
			default: {
				res.statusCode = 404;
				res.end('Page not Found');
			}
		}
	} else {
		res.statusCode = 400;
		res.setHeader('Content-Type', 'text/plain');
		res.end('Bad Request');
	}
});
server.listen(port, () => {
	console.log(`Server running on port: ${port}`);
});

// const currentURL = new URL(req.url || '/', `http://${req.headers.host}`);
// if (req.url === undefined) {
// 	res.statusCode = 400;
// 	res.setHeader('Content-Type', 'text/plain');
// 	res.end('Bad Request');
// }

// const usersRoute = '/api/users';
// const routes = [usersRoute];
// const index = routes.findIndex((r) => currentURL.pathname.includes(r, 0));

// if (index !== -1) {
// 	const currentRoute = routes[index];
// 	const restRoute = currentURL.pathname;
// }
// if (currentURL.pathname.includes(route, 0)) {
// 	const restStr = currentURL.pathname.slice(route.length);
// 	console.log(
// 		'slice ----->: ',
// 		currentURL.pathname,
// 		JSON.stringify(restStr)
// 	);
// }
// res.statusCode = 200;
// res.setHeader('Content-Type', 'text/plain');
// res.end('Hello World\n');
