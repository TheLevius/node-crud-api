import { createServer } from 'node:http';
import Router from './router/Router.js';
import UsersController from './controllers/UsersController.js';
import UsersCRUD, { User } from './services/UsersCRUD.js';
import Validator from './services/Validator.js';

const port = 3020;
const usersTable: User[] = [];
const usersController = new UsersController({
	usersCRUD: new UsersCRUD(usersTable),
	validator: new Validator(),
});
const router = new Router();

router.get('/api/users', usersController.getAll);
router.get('/api/users/:id', usersController.getOneById);
router.post('/api/users', usersController.createUser);
router.put('/api/users/:id', usersController.updateById);
router.delete('/api/users/:id', usersController.deleteById);

export const server = createServer(router.requestHandler).listen(port, () => {
	console.log(`Server started on port: ${port}`);
});
