const config = require('../config');
const cron = require('node-cron'); // https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-example
const GoogleCalendarApiService = require('./googleCalendarApi.service');
const InstagramApiService = require('./instagramApi.service');
const GoogleSheetsApiService = require('./googleSheetsApi.service');

class CronService {
	static init() {
		this.channels = [];
		cron.schedule(config.cron.publishTime, () => this.fetchEvents());
		if(process.env.CALENGRAM_POST_ON_STARTUP && process.env.CALENGRAM_POST_ON_STARTUP.toLowerCase() === 'true') {
			this.fetchEvents();
		}
	}
	static async getChannels() {
		if (!config.google_spreadsheet) return [];
		try {
			return await GoogleSheetsApiService.fetchData(config.google_spreadsheet);
		} catch (error) {
			console.error(error);
			return Promise.resolve(this.channels);
		}
	}
	static async fetchEvents() {
		this.channels = await this.getChannels();
		const day = new Date(); // '2021-05-17'; //
		const events = await GoogleCalendarApiService.fetchEvents(day);
		console.log(new Date().toISOString(), '[CronService]', events);
		if (events.length > config.maxStoryEvents) {
			const splitEvents = events;
			while (splitEvents.length) {
				const storyEvents = splitEvents.splice(0, config.maxStoryEvents);
				await InstagramApiService.postStory(day, storyEvents, this.channels, splitEvents.length);
			}
		} else {
			await InstagramApiService.postStory(day, events, this.channels);
		}
	}
}

module.exports = CronService;
