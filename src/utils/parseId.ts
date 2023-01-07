export default (route: string, pathname: string): string => {
	const slicedStr = pathname.slice(route.length);
	const matched = slicedStr.match(/.?\/\S+\/|.?\/\S+$/);
	if (matched == null) {
		return '';
	}
	const result = matched[0].slice(1, matched[0].length - 1);
	return result;
};
