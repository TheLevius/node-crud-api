export default (route: string, pathname: string): string => {
	const idPattern = new RegExp(`(?<=${route}/).+?(?=/|$)`);
	const matched = pathname.match(idPattern);
	if (matched === null) {
		return '';
	}
	return matched[0];
};
