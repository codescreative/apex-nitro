const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const logger = require('./log-service');
const npmService = require('./npm-service');

const installTemplate = (templateName, installPath) => {
	logger.logInfo(`installing template "${templateName}"`);
	fs.ensureDirSync(installPath);
	return npmService.installPackage(templateName, installPath);
};

const installDependencies = appPath => {
	logger.logInfo('installing dependencies');
	return npmService.installDependencies(appPath);
};

const copyFilesSync = (fromPath, toPath) => {
	try {
		logger.logInfo('copying template files');
		fs.copySync(fromPath, toPath);
	} catch (error) {
		logger.logError('Error while copying the template files: ', error);
		throw new Error('Error while copying the template files: ', error);
	}
};

const initTemplate = async (initFilePath, appDetails) => {
	logger.logInfo('initializing template');
	const init = require(path.resolve(initFilePath));
	const proConfig = await init(appDetails);
	return proConfig;
};

const remove = async filePath => {
	logger.logInfo('cleaning up installation');
	await fs.remove(filePath);
};

const getTemplateNameFromGitUrl = gitUrl => {
	return gitUrl
		.split('/')
		.pop()
		.split('.')[0];
};

const getNpmInstallUrlFromGitUrl = gitUrl => {
	const protocol = gitUrl.match(/[https|ssh]+/i)[0];
	return `git+${protocol}://git@${gitUrl.replace(protocol + '://', '')}`;
};

const initBrowserSync = async browserSyncQuestions => {
	// Get browsersync config
	const browserSyncConfig = await inquirer.prompt(browserSyncQuestions);

	// Set browsersync defaults
	if (browserSyncConfig.browsersync.defaults === 'default') {
		browserSyncConfig.browsersync.realTime = true;
		browserSyncConfig.browsersync.ghostMode = false;
		browserSyncConfig.browsersync.notify = true;
		browserSyncConfig.apex = {};
		browserSyncConfig.apex.openBuilder = false;
		delete browserSyncConfig.browsersync.defaults;
	}

	return browserSyncConfig;
};

const initPublish = async publishQuestions => {
	// Get publish config
	const publishConfig = await inquirer.prompt(publishQuestions);

	// Set publish defaults
	if (publishConfig.publish.defaults === 'default') {
		publishConfig.publish.destination = 'application';
		publishConfig.publish.path = 'sqlcl';
		publishConfig.publish.username = '';
		publishConfig.publish.password = '';
		publishConfig.publish.connectionString = '';
		delete publishConfig.publish.defaults;
	} else if (publishConfig.publish.password !== '') {
		publishConfig.publish.password = '***************';
	}

	return publishConfig;
};

/**
 * @exports templateCreationService
 * @description File that includes all the necessary steps during the creation of a new app
 */
module.exports = {
	installTemplate,
	installDependencies,
	copyFilesSync,
	initTemplate,
	remove,
	getTemplateNameFromGitUrl,
	getNpmInstallUrlFromGitUrl,
	initBrowserSync,
	initPublish
};