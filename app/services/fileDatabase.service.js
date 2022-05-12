/*
    Twitch Data Exporter allows data export from Twitch API to analize.
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
    along with this program.  If not, see <https://github.com/pvillaverde/twitch-data-exporter/blob/master/LICENSE>.
*/
const fs = require('fs');

class FileDatabaseService {
	constructor(name) {
		this.basePath = `app/data/${name}`;

		if (!fs.existsSync(this.basePath)) {
			console.log('[MiniDb]', 'Create base directory:', this.basePath);
			fs.mkdirSync(this.basePath);
		}
	}

	get(id) {
		const filePath = `${this.basePath}/${id}.json`;

		try {
			if (fs.existsSync(filePath)) {
				const raw = fs.readFileSync(filePath, {
					encoding: 'utf8',
					flag: 'r',
				});
				return JSON.parse(raw) || null;
			}
		} catch (e) {
			console.error('[MiniDb]', 'Write error:', filePath, e);
		}
		return null;
	}

	put(id, value) {
		const filePath = `${this.basePath}/${id}.json`;

		try {
			const raw = JSON.stringify(value);
			fs.writeFileSync(filePath, raw, {
				encoding: 'utf8',
				mode: '666',
				flag: 'w',
			});
			return true;
		} catch (e) {
			console.error('[MiniDb]', 'Write error:', filePath, e);
			return false;
		}
	}
}

module.exports = FileDatabaseService;
