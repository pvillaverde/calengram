const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const config = require('../config.js');

/**
 * Google Sheets Api Helper.
 */
class GoogleSheetsApiService {
	// The file token.json stores the user's access and refresh tokens, and is
	// created automatically when the authorization flow completes for the first
	// time.
	static get tokenPath() {
		return 'app/security/googleSheetsToken.json';
	}
	// If modifying these scopes, delete googleToken.json.
	static get scopes() {
		return ['https://www.googleapis.com/auth/spreadsheets.readonly'];
	}
	static handleApiError(error, message) {
		if (message) {
			console.error('[GoogleSheetsAPIService]', 'API request failed with error:', error, message);
		} else {
			console.error('[GoogleSheetsAPIService]', 'API request failed with error:', error);
		}
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
	 * Prints the names and majors of students in a sample spreadsheet:
	 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
	 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
	 */
	static fetchData(spreadSheet) {
		return this.authorize().then(
			(auth) =>
				new Promise((resolve, reject) => {
					const sheets = google.sheets({ version: 'v4', auth });
					sheets.spreadsheets.values.get({ spreadsheetId: spreadSheet.id, range: spreadSheet.range }, (err, res) => {
						if (err) {
							this.handleApiError(err, 'The Api returned an error');
							return reject(err);
						}
						const rows = res.data.values;
						if (rows.length) {
							const headers = spreadSheet.headers.split(',');
							// Map row columns to object propertiesPrint columns A and E, which correspond to indices 0 and 4.
							const mappedRows = rows.map((row) => {
								const newRow = {};
								for (var i = 0; i < headers.length; i++) {
									newRow[headers[i]] = row[i];
								}
								return newRow;
							});
							resolve(mappedRows);
						} else {
							console.log('No data found.');
							this.handleApiError(err, 'No data found');
							reject(err);
						}
					});
				})
		);
	}
}

module.exports = GoogleSheetsApiService;
