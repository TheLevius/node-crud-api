import { IncomingMessage, ServerResponse } from 'http';



const router = (route: string, handler: Handler): void => {
	
}


export default (
	req: IncomingMessage,
	res: ServerResponse<IncomingMessage>
): Router => {
	return (route, handler) => {

		if (req.url?.includes(route, 0)) {
			const restRoute = req.url.slice(route.length)
			console.log(restRoute);
			handler(req, res);
		}
	};
};

type Router = (route: string, controller: Handler) => void;
type Handler = (
	req: IncomingMessage,
	res: ServerResponse<IncomingMessage>
) => void;
