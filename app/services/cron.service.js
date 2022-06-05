/*
    Calengram allows to post a story to isntagram based on google calendar events
    Copyright (C) 2021 Pablo Villaverde Castro

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://github.com/pvillaverde/calengram/blob/master/LICENSE>.
*/
const config = require('../config');
const cron = require('node-cron'); // https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-example
const moment = require('moment');
const GoogleCalendarApiService = require('./googleCalendarApi.service');
const InstagramApiService = require('./instagramApi.service');
const GoogleSheetsApiService = require('./googleSheetsApi.service');
const DiscordService = require('./discord.service');

class CronService {
	static init() {
		this.channels = [];
		cron.schedule(config.cron.publishTime, () => this.fetchEvents());
		if (config.discord && config.discord.channelId) {
			cron.schedule(config.cron.discordCalendar, () => this.fetchWeekEvents());
		}
		if (process.env.CALENGRAM_POST_ON_STARTUP && process.env.CALENGRAM_POST_ON_STARTUP.toLowerCase() === 'true') {
			this.fetchEvents();
			if (config.discord && config.discord.channelId) {
				cron.schedule(config.cron.discordCalendar, () => this.fetchWeekEvents());
			}
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
	static async fetchWeekEvents() {
		const fields = [];
		let day = moment();
		while (moment(day).diff(moment(), 'days') < config.discord.days) {
			fields.push({
				title: moment(day).locale(config.momentLocale).format('dddd - D [de] MMMM'),
				events: await GoogleCalendarApiService.fetchEvents(day.toDate()),
			});
			day.add(1, 'day');
		}
		DiscordService.updateCalendar(fields);
	}
}

module.exports = CronService;
