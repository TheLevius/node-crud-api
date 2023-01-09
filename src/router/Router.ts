import { IncomingMessage, ServerResponse } from 'node:http';

export default class {
	routes: Route[];
	constructor() {
		this.routes = [];
	}
	_reg = (method: Methods, inputRoute: string, handler: Function) => {
		let route = inputRoute;
		let routeType: RouteType = 'exact';
		let relativeRouteCortegeParams: string[] = [];
		const endOfRoute = '/:';
		const endOfRouteIndex = route.indexOf(endOfRoute);
		if (endOfRouteIndex !== -1) {
			routeType = 'relative';
			relativeRouteCortegeParams = route
				.slice(endOfRouteIndex + endOfRoute.length)
				.split('/');
			route = route.slice(0, endOfRouteIndex);
		}
		const routeIndex = this.routes.findIndex((r) => route === r.route);
		if (routeIndex !== -1) {
			const verbHandlers = {
				...this.routes[routeIndex][routeType],
				[method]: handler,
			};

			this.routes[routeIndex][routeType] = verbHandlers;
			this.routes[routeIndex].cortegeParams = {
				...this.routes[routeIndex].cortegeParams,
				...relativeRouteCortegeParams,
			};
		} else {
			const newRouteObj: Route = {
				route,
				cortegeParams: relativeRouteCortegeParams,
				[routeType]: {
					[method]: handler,
				},
			};
			this.routes.push(newRouteObj);
		}
		return;
	};
	get = (route: string, handler) => this._reg('GET', route, handler);
	post = (route: string, handler) => this._reg('POST', route, handler);
	put = (route: string, handler) => this._reg('PUT', route, handler);
	delete = (route: string, handler) => this._reg('DELETE', route, handler);

	requestHandler = (
		req: IncomingMessage & { params?: { [key: string]: string } },
		res: ServerResponse<
			IncomingMessage & { params?: { [key: string]: string } }
		>
	) => {
		if (req.url !== undefined && req.method !== undefined) {
			const currentURL = new URL(req.url, `http://${req.headers.host}`);

			const matchedRouteIndex = this.routes.findIndex(({ route }) =>
				currentURL.pathname.includes(route, 0)
			);

			if (matchedRouteIndex !== -1) {
				const currentRoute = this.routes[matchedRouteIndex].route;
				const routeType: RouteType = this._defineRouteType(
					currentRoute,
					currentURL.pathname
				);

				if (routeType === 'relative') {
					const restRoute = currentURL.pathname.slice(
						currentRoute.length
					);
					const routeCortegeParams =
						this.routes[matchedRouteIndex].cortegeParams;

					if (routeCortegeParams !== undefined) {
						const requestParams = this._getParams(restRoute);
						req.params = requestParams.reduce((acc, el, i) => {
							acc[routeCortegeParams[i]] = el;
							return acc;
						}, {});
					}
				}

				const verbHandlers = this.routes[matchedRouteIndex][routeType];

				if (
					verbHandlers !== undefined &&
					verbHandlers[req.method] !== undefined
				) {
					verbHandlers[req.method](req, res);
					return;
				} else {
					res.statusCode = 400;
					res.setHeader('Content-Type', 'text/plain');
					res.end('Bad Request');
					return;
				}
			} else {
				res.statusCode = 400;
				res.setHeader('Content-Type', 'text/plain');
				res.end('Bad Request');
				return;
			}
		} else {
			res.statusCode = 400;
			res.setHeader('Content-Type', 'text/plain');
			res.end('Bad Request');
			return;
		}
	};

	_defineRouteType = (route: string, pathname: string): RouteType => {
		return route === pathname || route + '/' === pathname
			? 'exact'
			: 'relative';
	};

	_getParams = (restRoute: string): string[] => restRoute.slice(1).split('/');
}

type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RouteType = 'exact' | 'relative';
type MethodHandlers = {
	GET?: Function;
	POST?: Function;
	PUT?: Function;
	DELETE?: Function;
};
type Route = {
	route: string;
	exact?: MethodHandlers;
	relative?: MethodHandlers;
	cortegeParams?: string[];
};
