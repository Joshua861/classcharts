module.exports = {
	globDirectory: 'src/',
	globPatterns: [
		'**/*.{ts,html,pcss,js,svelte}'
	],
	swDest: 'src/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};