# Calengram

[![GitHub license][license-shield]][license-url]


<!-- TABLE OF CONTENTS, generated with gh-md-toc README.md -->

Table of Contents
=================

   * [Calengram](#calengram)
      * [About The Project](#about-the-project)
         * [Built With](#built-with)
      * [Getting Started](#getting-started)
         * [Prerequisites](#prerequisites)
         * [Installation](#installation)
      * [Usage](#usage)
         * [Customizing refresh intervals](#customizing-refresh-intervals)
      * [Roadmap](#roadmap)
      * [Contributing](#contributing)
      * [Authors](#authors)
      * [Acknowledgements](#acknowledgements)
      * [License](#license)

<!-- ABOUT THE PROJECT -->

## About The Project

**Calengram** fetch events from a Google Calendar daily and post thems as a Story on Instagram.

Miss the one you wanted? [Request a feature][issues-url] or consider [contributing](#contributing) to the project!
### Built With

* [NodeJS](https://nodejs.org/es/)
* [Docker](https://www.docker.com/)


<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

Project is build on node and uses many npm packages, You need to set up:
* [NodeJS](https://nodejs.org/es/): Follow the instructions on the webpage.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Setup your `base_calendar.png` image and adjust margin and other image settings on instagramApiService if needed.
2. (Optional) Setup a Google App if you want to retrieve channels from a spreadsheed. Follow the [Node Quickstart Guide](https://developers.google.com/sheets/api/quickstart/nodejs) to download `credentials.json`.
2. Clone the repository
   ```sh
   git clone https://github.com/pvillaverde/calengram
   ```
3. Install NPM packages dependencies
   ```sh
   npm install
   ```
4. Copy `config_example.js` as `config.js` and enter your calendarId as well as the content of credentials.json on `google_credentials`.
   ```JS
	calendarId: 'galegotwitch@gmail.com',
	google_credentials: {/*credentials.json*/},
   ```
5. Setup other settings: Max events per story, if user should be mentioned and credentials for the instagram user.
   ```JS
	maxStoryEvents: 9, // Max events per story image.
	maxEventLength: 64, // Max characters per event
	mentionAlways: false, // Wheter or not to mention OUR user on every story.
	instagram: {
		id: '', // Instagram User ID
		username: '', // Instagram User Email
		password: '', // Instagram User Password
	},
	```
6. Start the app by runing `npm start` or `node app/index.js` and follow the steps for google Api auth.
7. If you want to launch a docker, once you have all setup and ready, build the image and run it with:
   ```sh
   docker build -t pvillaverde/calengram .
   docker run --name calengram  -d pvillaverde/calengram
   ```

<!-- USAGE EXAMPLES -->

## Usage

As you have seen previously, you can choose how the app learns which channels to check from 2 options:
1. Defining the `twitch.channels` variable on `config.js` with an array of channels name, ex:// `[clankirfed,twitch_en_galego]`
2. Setting up Google Sheets API and specifying a Google Spreadsheet on `config.js`which shall have the channels names on the first column:
```JS
	google_spreadsheet: { // set to null if dont want to use mentions
		id: '1AFbvk9SLOpOyST4VWG6IOkiMdclzExUPQrKUBuEUHKY', // Google Spreadsheet ID
		range: 'Canles!A2:C', // Sheet & Range
		headers: 'name,iguser,igid', // Column Headers (Use them for specifying channel name, instagram @user and Instagram ID)
	},
```

### Customizing refresh intervals
Lastly, you can choose when to retrieve each data on the `cron` option of `config.js`, by default it is setup like this:

```JS
// Minutes Hours DayOfMonth Month DayOfWeek
fetchEvents: '0 8 * * *', // Events will be fetched from calendar each day at 8AM
```

These intervals can be customized using the cron syntax:
```
  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | month
  | | | day of month
  | | hour
  | minute
  second ( optional )
```

<!-- ROADMAP -->

## Roadmap

Check out the [open issues][issues-url] page for a list of proposed features (and known issues).


<!-- CONTRIBUTING -->

## Contributing

If you want to add any missing feature or storage that feed your needs, go ahead! That's what make the open source community shines, by allowing us to grow and learn from each other creating amazing tools! Any contribution you make is **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Authors

Pablo Villaverde Castro - [@clankirfed](https://twitter.com/clankirfed)


<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements
* [Instagram Private API](https://github.com/dilame/instagram-private-api/)
* [Ultimate Text to Image](https://github.com/terence410/ultimate-text-to-image)
* [How to use Node Cron](https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples)
* [TOC Generator](https://github.com/ekalinin/github-markdown-toc)
* [Dockerizing NodeJs WebApp](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
* [Building Efficient NodeJS DockerFiles](http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/)


## License


[![GitHub license][license-shield]][license-url]

Distributed under the GNU GPL-v3 License. See `LICENSE` for more information.


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/badge/license-GNU%20GPL--v3-brightgreen
[license-url]: https://github.com/pvillaverde/calengram/blob/master/LICENSE
[project-url]: https://github.com/pvillaverde/calengram
[issues-url]: https://github.com/pvillaverde/calengram/issues