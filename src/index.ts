import { createServer } from 'node:http';
import Router from './router/Router.js';
import UsersController from './controllers/UsersController.js';
import UsersCRUD, { User } from './services/UsersCRUD.js';
import Validator from './services/Validator.js';
import dotenv from 'dotenv';
dotenv.config();

const port = Number(process.env.PORT);
const usersTable: User[] = [];
const usersController = new UsersController({
	usersCRUD: new UsersCRUD(usersTable),
	validator: new Validator(),
});
const apiRouter = new Router();

apiRouter.get('/api/users', usersController.findAll);
apiRouter.get('/api/users/:id', usersController.findOneById);
apiRouter.post('/api/users', usersController.create);
apiRouter.put('/api/users/:id', usersController.updateById);
apiRouter.delete('/api/users/:id', usersController.deleteById);

export const server = createServer(apiRouter.requestHandler).listen(
	port,
	() => {
		console.log(`Server started on port: ${port}`);
	}
);
