(async () => {
    try {
        const fs = require('fs');
        const twitter = require('./twitter.js');

        const username = process.argv[2];
        const limit = parseInt(process.argv[3] || '');

        if (! username) {
            console.log(`usage: node followers.js <username> <limit>`);
            process.exit(1);
        }

        var total = 0;
        const filename = `${username}-${limit ? limit : ''}followers.jsonl`;
        console.log(`writing to ${filename}...`);
        if (fs.existsSync(filename)) {
            fs.truncateSync(filename);
        }
        for await (var user of twitter.bulk_followers(username)) {
            fs.appendFileSync(filename, JSON.stringify(user) + '\n');
            total += 1;
            if (limit && total == limit) break;
            if (total % 100 == 0) {
                process.stdout.write(`\r${total} lines`);
            }
        }
        process.stdout.write(`\r${total} lines`);
        console.log();

    } catch (e) {
        console.error(e);
    }
})();
