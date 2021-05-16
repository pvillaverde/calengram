const GoogleCalendarApiService = require('./services/googleCalendarApi.service');
const GoogleSheetsApiService = require('./services/googleSheetsApi.service');
const InstagramApiService = require('./services/instagramApi.service');
const CronService = require('./services/cron.service');
const fs = require('fs');
const config = require('./config');

async function bootstrapApp() {
	console.log(' ');
	console.log(' ----------------------------------');
	console.log('|            Calengram             |');
	console.log(`|  Pablo Villaverde Castro © 2021  |`);
	console.log('|       clankirfed@gmail.com       |');
	console.log(' ----------------------------------');
	console.log(' ');
	if (!fs.existsSync(GoogleCalendarApiService.tokenPath)) {
		try {
			fs.mkdirSync(GoogleCalendarApiService.tokenPath.substring(0, GoogleCalendarApiService.tokenPath.lastIndexOf('/')));
		} catch (error) {}
		GoogleCalendarApiService.authorize();
	} else if (!fs.existsSync(GoogleSheetsApiService.tokenPath) && config.google_spreadsheet) {
		try {
			fs.mkdirSync(GoogleSheetsApiService.tokenPath.substring(0, GoogleSheetsApiService.tokenPath.lastIndexOf('/')));
		} catch (error) {}
		GoogleSheetsApiService.authorize();
	} else {
		InstagramApiService.init();
		CronService.init();
	}
}

bootstrapApp();
