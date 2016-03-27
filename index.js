'use strict';
const got = require('got');
const cheerio = require('cheerio');
const termImg = require('term-img');
const spawn = require('execa').spawn;

function wait() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, 4000);
	});
}

function step(urls) {
	urls.reduce((p, url) => {
		return p.then(() => {
			return wait()
				.then(() => fetchImage(url))
				.then(fetchImageBuffer)
				.then(termImg);
		});
	}, Promise.resolve());
}

function fetchImageBuffer(url) {
	return got(url, {
		encoding: null,
		headers: {
			Referer: 'http://www.pixiv.net/'
		}
	}).then(res => res.body);
}

function fetchImage(url) {
	return got(url).then(res => {
		const $ = cheerio.load(res.body);
		return $('.img-container img').attr('src');
	});
}

function fetchRanking() {
	return got('http://www.pixiv.net/ranking.php?mode=daily').then(res => {
		const $ = cheerio.load(res.body);
		return $('.ranking-image-item a').map((i, v) => {
			const href = $(v).attr('href');
			return `http://www.pixiv.net/${href}`;
		}).get();
	});
}

function isInstall(args) {
	return args[0] === 'i' || args[0] === 'install';
}

function npm(args) {
	return spawn('npm', args, {
		cwd: process.cwd(),
		stdio: isInstall(args) ? 'ignore' : 'inherit'
	});
}

function displayImages() {
	fetchRanking().then(step).catch(console.log);
}

module.exports = args => {
	const ps = npm(args);
	ps.on('exit', code => {
		process.exit(code);
	});

	if (isInstall(args)) {
		displayImages();
	}
};
