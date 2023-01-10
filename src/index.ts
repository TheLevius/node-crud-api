import http from 'node:http';
import Router from './router/Router.js';
import Handler from './controllers/Handler.js';
import UsersCRUD, { User } from './services/UsersCRUD.js';
import Validator from './services/Validator.js';

const port = 3020;
const usersTable: User[] = [];
const usersCrud = new UsersCRUD(usersTable);
const router = new Router();
const usersController = new Handler({ usersService: usersCrud });

router.get('/api/users', usersController.getAll);
router.get('/api/users/:id', usersController.getOneById);
router.post('/api/users', usersController.createUser);
router.put('/api/users/:id', usersController.updateById);
router.delete('/api/users/:id', usersController.deleteById);

export const server = http
	.createServer(router.requestHandler)
	.listen(port, () => {
		console.log(`Server running on port: ${port}`);
	});
