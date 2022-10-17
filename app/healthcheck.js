const moment = require('moment');
const FileDatabaseService = require('./services/fileDatabase.service');
const lastError = new FileDatabaseService('live-messages').get('last-error') || null;

const now = moment();
if (lastError) {
	console.log('Last error was at', moment(lastError).toISOString());
	if (now.diff(moment(lastError), 'minutes') <= 120) {
		process.exit(1);
	} else {
		process.exit(0);
	}
} else {
	console.error('Not known last error');
	process.exit(0);
}
