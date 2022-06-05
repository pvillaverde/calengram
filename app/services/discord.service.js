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
const Discord = require('discord.js');
const config = require('../config');
const axios = require('axios').default;
const moment = require('moment');
const FileDatabaseService = require('./fileDatabase.service.js');
const { discord } = require('../config');

class DiscordService {
	static init() {
		this.discordClient = new Discord.Client();
		this.calendarMessageId = new FileDatabaseService('discord').get('calendar-message-id') || null;
		this.discordClient.on('ready', () => {
			console.log(new Date(), '[DiscordService]', `Bot is ready, logged in as ${this.discordClient.user.tag}`);
			this.discordChannel = this.discordClient.channels.cache.get(config.discord.channelId);
		});
		this.discordClient.login(config.discord.bot_token);
	}

	static updateCalendar(fields) {
		// Se xa está publicada a mensaxe, facemos un patch. En caso contrario un post e gardamos a ID da mensaxe.
		const calendarMessage = new Discord.MessageEmbed();
		calendarMessage.setColor(`#9146ff`);
		calendarMessage.setTitle(`Calendario`);
		calendarMessage.setURL(`https://calendar.google.com/calendar/u/0/embed?src=${config.calendarId}`);
		for (const day of fields) {
			calendarMessage.addField(day.title, '`' + day.events.map((e) => e.substring(2)).join('\n') + '`');
		}
		calendarMessage.addField('Última actualización', moment().locale(config.momentLocale).format('yyyy-MM-DD HH:mm'), true);
		if (this.calendarMessageId) {
			this.editMessage(this.discordChannel, this.calendarMessageId, calendarMessage);
		} else {
			this.postMessage(this.discordChannel, calendarMessage);
		}
	}

	static postMessage(discordChannel, messageToSend) {
		return discordChannel
			.send(messageToSend)
			.then((message) => {
				this.calendarMessageId = message.id;
				new FileDatabaseService('discord').put('calendar-message-id', this.calendarMessageId);
			})
			.catch((e) => this.handleApiError(e, 'postMessage'));
	}

	static editMessage(discordChannel, messageId, editedMessage) {
		return discordChannel.messages
			.fetch(messageId)
			.then((existingMsg) => existingMsg.edit(editedMessage))
			.catch((e) => this.handleApiError(e, 'editMessage'));
	}

	static handleApiError(error, message) {
		if (message) {
			console.error('[DiscordService]', 'API request failed with error:', message, error);
		} else {
			console.error('[DiscordService]', 'API request failed with error:', error);
		}
		new FileDatabaseService('live-messages').put('last-error', moment());
	}
}

module.exports = DiscordService;
