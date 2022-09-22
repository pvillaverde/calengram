module.exports = {
	momentLocale: 'gl', // Moment language format
	calendarId: 'galegotwitch@gmail.com', // Calendar ID for event retrieval
	cron: {
		// Minutes Hours DayOfMonth Month DayOfWeek
		publishTime: '* * * * *', // When will the calendar be retrieved and posted to instagram
		discordCalendar: '* * * * *', // When will the calendar be retrieved and updated on discord
	},
	maxStoryEvents: 9, // Max events per story image.
	maxEventLength: 64, // Max characters per event
	mentionAlways: false, // Wheter or not to mention OUR user on every story.
	instagram: {
		id: '', // Instagram User ID
		username: '', // Instagram User Email
		password: '', // Instagram User Password
		publishNoEvents: false, // Set to true if you want to publish story even if there aren't events 
	},
	discord: {
		channelId: null, // Discord channel ID  (string. If null discord wont be used)
		bot_token: null, // Discord bot Token (string)
		days: 4,
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
