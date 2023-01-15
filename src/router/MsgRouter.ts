export default class {
	service = {};
	constructor({ service }) {
		this.service = service || {};
	}
	public msgHandler = (msg) => {
		this.service[msg.action](msg);
	};
}
