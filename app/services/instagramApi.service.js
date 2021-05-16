const config = require('../config');
const fs = require('fs').promises;
const { IgApiClient } = require('instagram-private-api');
const { StickerBuilder } = require('instagram-private-api/dist/sticker-builder');
const { getCanvasImage, HorizontalImage, registerFont, UltimateTextToImage, VerticalImage } = require('ultimate-text-to-image');
const moment = require('moment');

class InstagramApiService {
	static init() {
		this.ig = new IgApiClient();
	}

	static handleApiError(error, message) {
		if (message) {
			console.error('[InstagramApiService]', 'API request failed with error:', error, message);
		} else {
			console.error('[InstagramApiService]', 'API request failed with error:', error);
		}
	}

	static async login() {
		this.ig.state.generateDevice(config.instagram.username);
		await this.ig.simulate.preLoginFlow();
		this.loggedInUser = await this.ig.account.login(config.instagram.username, config.instagram.password);
		process.nextTick(async () => await this.ig.simulate.postLoginFlow());
	}

	static async postStory(day, events, channels, remainingEvents) {
		const file = await this.buildStory(day, events, remainingEvents);
		const filterChannels = this.filterEventChannels(events, channels);
		const stickerConfig = this.buildMentions(events, filterChannels);
		await this.login();
		try {
			await this.ig.publish.story({
				file,
				// this creates a new config	,
				moduleInfo: {
					module_name: 'profile',
					user_id: this.loggedInUser.pk,
					username: this.loggedInUser.username,
				},
				stickerConfig,
			});
			console.log('[InstagramApiService]', 'Story posted succesfully - Channels', filterChannels);
		} catch (err) {
			this.handleApiError(err, 'Error while trying to post story');
		}
	}

	static async buildStory(day, events, remainingEvents) {
		const buffer = await fs.readFile('app/data/base_calendar.png');
		const canvasBaseImage = await getCanvasImage({ buffer });
		// Texto Data
		const capitalizeFirstChar = (str) => str.charAt(0).toUpperCase() + str.substring(1);
		const dateString = capitalizeFirstChar(moment(day).locale('gl').format('dddd DD/MM/yyyy'));
		const canvasDateImage = await getCanvasImage({
			buffer: new UltimateTextToImage(dateString, {
				align: 'center',
				width: 1080,
				fontSize: 48,
				height: 1920,
				marginTop: 450,
				fontWeight: 'bold',
				fontFamily: 'Signika Negative',
			})
				.render()
				.toBuffer(),
		});
		const images = [
			{ canvasImage: canvasBaseImage, layer: 0, repeat: 'fit' },
			{ canvasImage: canvasDateImage, layer: 1, repeat: 'fit' },
		];
		// Determinar o espazo por evento e engadir as capas de eventos
		const eventSpace = 140;
		const totalSpace = 140 * events.length;
		for (let index = 0; index < events.length; index++) {
			const element = events[index].substring(0, 100) + (events[index].length > 100 ? '...' : '');
			const buffer = new UltimateTextToImage(element, {
				//	align: 'center',
				width: 1080,
				fontSize: 36,
				height: 1920,
				marginTop: 560 + eventSpace * index,
				marginLeft: 180,
				marginRight: 180,
				lineHeightMultiplier: 1.5,
				fontWeight: 'bold',
				fontFamily: 'Catamaran Medium',
			})
				.render()
				.toBuffer();
			const canvasEventImage = await getCanvasImage({ buffer });
			const eventLayer = { canvasImage: canvasEventImage, layer: 1, repeat: 'fit' };
			images.push(eventLayer);
		}
		// Engadir o último texto de "A quén verás hoxe"
		const finalText = remainingEvents ? '' : 'A quen verás hoxe?';
		return new UltimateTextToImage(finalText, {
			width: 1080,
			height: 1920,
			marginTop: 560 + totalSpace,
			align: 'center',
			fontSize: 36,
			fontWeight: 'bold',
			backgroundColor: '#FFFFFF99',
			images,
			fontFamily: 'Signika Negative',
		})
			.render()
			.toBuffer('image/jpeg', { quality: 80, progressive: true });
		//.toFile('app/data/output.jpg');
	}

	// Busca as canles que poden estar mencionadas no calendario para etiquetar os usuarios de instagram
	static filterEventChannels(events, channels) {
		return channels.filter((channel) => events.some((e) => e.toUpperCase().match(channel.name.toUpperCase())));
	}

	static buildMentions(channels = []) {
		const userIds = channels.map((c) => c.igid);
		const stickerConfig = new StickerBuilder();
		if (config.mentionAlways) {
			stickerConfig.add(StickerBuilder.mention({ userId: config.instagram.id }).center());
		}
		for (const userId of userIds) {
			stickerConfig.add(StickerBuilder.mention({ userId }).center());
		}
		return stickerConfig.build();
	}
}

module.exports = InstagramApiService;
