var crawler = require("crawler");
var fs = require('fs');
var https = require('https');
var mkdirp = require('mkdirp');
var path = require('path');
var url = require('url');

var initial_url = 'https://jcifs.samba.org/src/';
var target_dir = '/tmp';

var downloadFile = function (url, filePath) {
    var dirName = path.dirname(filePath);

    mkdirp.sync(dirName, 0755);

    var file = fs.createWriteStream(filePath);

    https.get(url, function (response) {
        response.pipe(file);
    });
};

var c = new crawler({
    maxConnections: 10,
    callback: function (error, result, $) {
        var skip = true;

        var base_url = result.uri;

        $('img[alt~="[DIR]"]').each(function (index, img) {
            var toQueueUrl = $(img).parent().parent().find('a').attr('href');
            if (!skip) {
                c.queue(base_url + toQueueUrl);
            } else {
                skip = false;
            }
        });

        $('img[alt="[TXT]"]').add('img[alt="[   ]"]').each(function (index, artifact) {
            var fullUrl = base_url + $(artifact).parent().parent().find("a").attr("href");
            var filePath = target_dir + '/' + fullUrl.substr(initial_url.length);

            console.log('Downloading ...', filePath);

            downloadFile(fullUrl, filePath);
        });
    }
});

c.queue(initial_url);

