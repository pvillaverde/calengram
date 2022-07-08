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
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const config = require('../config.js');
const moment = require('moment');
const FileDatabaseService = require('./fileDatabase.service.js');

/**
 * Google Sheets Api Helper.
 */
class GoogleCalendarApiService {
	// The file token.json stores the user's access and refresh tokens, and is
	// created automatically when the authorization flow completes for the first
	// time.
	static get tokenPath() {
		return 'app/security/googleCalendarToken.json';
	}
	// If modifying these scopes, delete googleToken.json.
	static get scopes() {
		return ['https://www.googleapis.com/auth/calendar.readonly'];
	}
	static handleApiError(error, message) {
		if (message) {
			console.error('[GoogleCalendarApiService]', 'API request failed with error:', error, message);
		} else {
			console.error('[GoogleCalendarApiService]', 'API request failed with error:', error);
		}
		new FileDatabaseService('live-messages').put('last-error', moment());
	}

	/**
	 * Create an OAuth2 client with the given credentials, and then execute the
	 * given callback function.
	 */
	static authorize() {
		return new Promise((resolve, reject) => {
			const { client_secret, client_id, redirect_uris } = config.google_credentials;
			const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
			// Check if we have previously stored a token.
			fs.readFile(this.tokenPath, (err, token) => {
				if (err) return this.getNewToken(oAuth2Client).then((oAuthClient) => resolve(oAuthClient));
				oAuth2Client.setCredentials(JSON.parse(token));
				resolve(oAuth2Client);
			});
		});
	}

	/**
	 * Get and store new token after prompting for user authorization, and then
	 * execute the given callback with the authorized OAuth2 client.
	 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
	 * @param {getEventsCallback} callback The callback for the authorized client.
	 */
	static getNewToken(oAuth2Client) {
		return new Promise((resolve, reject) => {
			const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: this.scopes });
			console.log('Authorize this app by visiting this url:', authUrl);
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
			});
			rl.question('Enter the code from that page here: ', (code) => {
				rl.close();
				oAuth2Client.getToken(code, (err, token) => {
					if (err) {
						this.handleApiError(err, 'Error while trying to retrieve access token');
						return reject(err);
					}
					oAuth2Client.setCredentials(token);
					// Store the token to disk for later program executions
					fs.writeFile(this.tokenPath, JSON.stringify(token), (err) => {
						if (err) {
							this.handleApiError(err, 'Error while trying to store access token');
							return reject(err);
						}
						console.log('Token stored to', this.tokenPath);
					});
					resolve(oAuth2Client);
				});
			});
		});
	}

	/**
	 * Lists the next 10 events on the user's primary calendar.
	 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
	 */
	static async fetchEvents(day) {
		const auth = await this.authorize();
		return new Promise((resolve, reject) => {
			const calendar = google.calendar({ version: 'v3', auth });
			calendar.events.list(
				{
					calendarId: config.calendarId,
					timeMin: moment(day).startOf('day').toISOString(),
					timeMax: moment(day).endOf('day').toISOString(),
					//maxResults: 10,
					singleEvents: true,
					orderBy: 'startTime',
				},
				(err, res) => {
					if (err) {
						this.handleApiError(err, 'The Api returned an error');
						return reject(err);
					}
					const events = res.data.items;
					if (events.length) {
						const timeRangeEvents = events.map(
							(event, i) => `⬜ ${moment(event.start.dateTime || event.start.date).format('HH:mm')} | ${event.summary}`
						);
						return resolve(timeRangeEvents);
					} else {
						console.log('No upcoming events found.');
						return resolve(["  -"])
					}
				}
			);
		});
	}
}

module.exports = GoogleCalendarApiService;
