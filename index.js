const ts = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'minecraft-scripting'
	],
	rules: {
		'@typescript-eslint/no-namespace': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'no-non-null-assertion': 'off'
	}
};

const js = {
	root: true,
	// This tells ESLint to load the config from the package `eslint-config-minecraft-scripting`
	extends: ['minecraft-scripting'],
	parserOptions: {
		tsconfigRootDir: __dirname
	}
};

async function setup({ InfoHandler, NpmHandler, IO }) {
	const { language } = await InfoHandler.getInfo();

	console.log('[start] setup eslint...');

	if (language === 'ts') {
		NpmHandler.add(
			'eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-minecraft-linting'
		);
		IO.writeJSON('.eslintrc', ts);
	} else {
		NpmHandler.add('eslint eslint-plugin-minecraft-linting');
		IO.writeJSON('.eslintrc', js);
	}

	IO.writeText('.eslintignore', 'node_modules\nout');

	const package_ = IO.readJSON('package.json');

	if (!package_['scripts']) package_['scripts'] = {};

	package_['scripts']['lint'] = 'eslint . --ext .ts';

	IO.writeJSON(package_, 'package.json');

	console.log('[done] setup eslint.');
}

export default async function (program, handlers) {
	InfoHandler.bind('ext');
	program
		.command('eslint-setup')
		.alias('ess')
		.description('install eslint for the project')
		.action(() => setup(handlers));

	program
		.command('eslint-lint')
		.alias('esl')
		.description('check code for compliance with current eslint standards')
		.action(() => IO.exec('npm run lint'));
}
