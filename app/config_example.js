module.exports = {
	calendarId: 'galegotwitch@gmail.com', // Calendar ID for event retrieval
	cron: {
		// Minutes Hours DayOfMonth Month DayOfWeek
		publishTime: '* * * * *', // When will the calendar be retrieved and posted to instagram
	},
	maxStoryEvents: 9, // Max events per story image.
	mentionAlways: false, // Wheter or not to mention OUR user on every story.
	instagram: {
		id: '', // Instagram User ID
		username: '', // Instagram User Email
		password: '', // Instagram User Password
	},
	google_spreadsheet: { // set to null if dont want to use mentions
		id: '1AFbvk9SLOpOyST4VWG6IOkiMdclzExUPQrKUBuEUHKY', // Google Spreadsheet ID
		range: 'Canles!A2:C', // Sheet & Range
		headers: 'name,iguser,igid', // Column Headers (Use them for specifying channel name, instagram @user and Instagram ID)
	},
	google_credentials: {
		/*credentials.json*/
	},
};
