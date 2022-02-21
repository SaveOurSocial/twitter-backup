(async () => {
    try {
        const fs = require('fs');
        const { Transform } = require('json2csv');

        const inputFilename = process.argv[2];
        const outputFilename = inputFilename.replace(/\..+$/, '') + '.csv';

        if (! inputFilename) {
            console.log(`usage: node make-csv.js <filename.txt>`);
            process.exit(1);
        }

        function tranform_record(item) {
            // remove newlines in profile description
            item.description = item.description.replace(/[\r\n ]+/g, ' ');
            // replace url with real url
            if (item.entities.url) {
                item.url = item.entities.url.urls[0].expanded_url;
            }
            // replace Twitter links in bio with real links
            item.entities.description.urls.map(
                (v) => item.description = item.description.replace(v.url, v.display_url)
            );
            // add twitter link
            item.twitter_link = `https://twitter.com/${item.screen_name}`;
            return item;
        }

        if (fs.existsSync(outputFilename)) {
            fs.truncateSync(outputFilename);
        }

        const fields = ['name', 'twitter_link', 'location', 'url', 'followers_count', 'statuses_count', 'description'];
        const transforms = [tranform_record];
        const opts = { fields, transforms };
        const transformOpts = { highWaterMark: 16384, encoding: 'utf-8' };

        const input = fs.createReadStream(inputFilename, { encoding: 'utf8' });
        const output = fs.createWriteStream(outputFilename, { encoding: 'utf8' });
        const json2csv = new Transform(opts, transformOpts);

        input.pipe(json2csv).pipe(output);

        var lines = 0;
        console.log(`writing to ${outputFilename}...`);
        json2csv.on('line', line => {
            lines++;
            if (lines % 1000 == 0) {
                process.stdout.write(`\r${lines} lines`);
            }
        });
        json2csv.on('end', () => {
            process.stdout.write(`\r${lines} lines`);
            console.log();
        });
    } catch (e) {
        console.error(e);
    }
})();
