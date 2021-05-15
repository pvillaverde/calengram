const GoogleCalendarApiService = require('./services/googleCalendarApi.service');
const InstagramApiService = require('./services/instagramApi.service');
const CronService = require('./services/cron.service');
const fs = require('fs');

async function bootstrapApp() {
	console.log(' ');
	console.log(' ----------------------------------');
	console.log('|     Twitch Data Exporter         |');
	console.log(`|  Pablo Villaverde Castro © 2021  |`);
	console.log('|       clankirfed@gmail.com       |');
	console.log(' ----------------------------------');
	console.log(' ');
	if (!fs.existsSync(GoogleCalendarApiService.tokenPath)) {
		try {
			fs.mkdirSync(GoogleCalendarApiService.tokenPath.substring(0, GoogleCalendarApiService.tokenPath.lastIndexOf('/')));
		} catch (error) {}
		GoogleCalendarApiService.authorize();
	} else {
		InstagramApiService.init();
		CronService.init();
	}
}

bootstrapApp();
