import { validate as isUuid } from 'uuid';
export default class {
	private boolCheckers: BoolCheckers[] = [
		'notNull',
		'required',
		'properType',
		'isArrayOf',
		'isProperId',
	];
	constructor() {}

	public validate = (obj: object, schemaProps: Prop[]): CheckResult => {
		if (!Array.isArray(schemaProps) || schemaProps.length === 0) {
			return { errors: ['Invalid Schema'], status: Statuses.ERROR };
		}

		const errors: Prop[] = schemaProps.reduce((acc: Prop[], prop) => {
			const checkPropResult = this.validateProp(obj, prop);
			if (checkPropResult?.errors && checkPropResult.errors.length > 0) {
				acc.push(checkPropResult);
			}
			return acc;
		}, []);

		const status = errors.length === 0 ? Statuses.OK : Statuses.ERROR;

		return { errors, status };
	};

	private validateProp = (obj: object, prop: Prop): Prop => {
		prop.errors = prop.checks.reduce((acc: CheckError[], check) => {
			if (this.boolCheckers.includes(check)) {
				if (
					check === 'properType' &&
					!Object.hasOwn(prop, 'expectTypes')
				) {
					acc.push({
						checker: check,
						expected: 'required expectTypes',
						received: 'missing expectTypes',
					});
				} else if (
					check === 'isArrayOf' &&
					!Array.isArray(prop?.expectArrayOf)
				) {
					acc.push({
						checker: check,
						expected: 'required expectArrayOf',
						received: 'incorrect format expectArrayOf',
					});
				} else {
					const res: boolean = this[check](prop, obj);
					if (!res) {
						acc.push({
							checker: check,
							expected: true,
							received: res,
						});
					}
				}
			} else {
				acc.push({
					checker: check,
					expected: this.boolCheckers,
					received: check,
				});
			}
			return acc;
		}, []);

		return prop;
	};

	private notNull = (prop: Prop, obj: object): boolean =>
		obj[prop.key] !== null;
	private required = (prop: Prop, obj: object): boolean =>
		Object.hasOwn(obj, prop.key);
	private properType = (prop: Prop, obj: object): boolean => {
		const currentTableType = typeof obj[prop.key];
		if (!Object.hasOwn(obj, prop.key)) {
			return true;
		}
		if (currentTableType === 'object') {
			return (
				prop.expectTypes?.includes(currentTableType) ||
				Array.isArray(obj[prop.key])
			);
		}
		return prop?.expectTypes?.includes(currentTableType) || false;
	};
	private isArrayOf = (prop: Prop, obj: object): boolean => {
		const expectArrayOf = prop.expectArrayOf ?? [];
		if (expectArrayOf?.length === 0) {
			return false;
		}

		return !obj[prop.key].some((value: unknown) => {
			return !expectArrayOf.includes(typeof value);
		});
	};
	private isProperId = (prop: Prop, obj: object): boolean =>
		isUuid(obj[prop.key]);
}

type BoolCheckers =
	| 'notNull'
	| 'required'
	| 'properType'
	| 'isArrayOf'
	| 'isProperId';

type CheckError = CheckPropError | CheckUnknownError;
type CheckPropError = {
	checker: BoolCheckers;
	expected: boolean;
	received: boolean;
};
type CheckUnknownError = {
	checker: string;
	expected: string | BoolCheckers[];
	received: string;
};
export type Prop = {
	key: string;
	checks: BoolCheckers[];
	expectTypes?: TypeTableValues[];
	expectArrayOf?: string[];
	errors?: CheckError[];
};
const enum Statuses {
	OK = 'OK',
	ERROR = 'ERROR',
}

type TypeTableValues =
	| 'undefined'
	| 'object'
	| 'boolean'
	| 'number'
	| 'bigint'
	| 'string'
	| 'symbol'
	| 'function'
	| 'array';

type CheckResult = {
	errors: (Prop | string)[];
	status: Statuses;
};
