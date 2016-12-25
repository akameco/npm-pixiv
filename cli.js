#!/usr/bin/env node
'use strict';
const co = require('co');
const got = require('got');
const delay = require('delay');
const spawn = require('execa');
const Pixiv = require('pixiv-app-api');
const termImg = require('term-img');

function fetchImageBuffer(url) {
	const opts = {
		encoding: null,
		headers: {
			Referer: 'http://www.pixiv.net/'
		}
	};
	return got(url, opts).then(res => res.body);
}

function fetchRanking() {
	return new Pixiv().illustRanking().then(body =>
		body.illusts.map(v => v.imageUrls.large)
	);
}

const isInstall = args => args[0] === 'i' || args[0] === 'install';

function npm(args) {
	const opts = {
		cwd: process.cwd(),
		stdio: isInstall(args) ? 'ignore' : 'inherit'
	};
	return spawn('npm', args, opts);
}

function step(urls) {
	co(function * () {
		for (const url of urls) {
			yield fetchImageBuffer(url).then(termImg);
			yield delay(1000);
		}
	});
}

function displayImages() {
	return fetchRanking().then(step).catch(console.error);
}

function run(args) {
	const ps = npm(args);
	ps.on('exit', code => {
		process.exit(code);
	});

	if (isInstall(args)) {
		displayImages();
	}
}

run(process.argv.slice(2));
