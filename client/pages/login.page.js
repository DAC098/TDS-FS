module.exports = {
	site_page: true,
	name: 'login.page',
	route: '/login',
	script: 'pages.main.js',
	element: {
		req: require('../../ui/containers/Login.js'),
		filename: 'Login.js'
	}
};
