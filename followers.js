(async () => {
    try {
        const fs = require('fs');
        const twitter = require('./twitter.js');

        const username = process.argv[2];

        if (! username) {
            console.log(`usage: node bulk.js <username>`);
            process.exit(1);
        }

        var total = 0;
        const filename = `${username}-followers.jsonl`;
        console.log(`writing to ${filename}...`);
        if (fs.existsSync(filename)) {
            fs.truncateSync(filename);
        }
        for await (var user of twitter.bulk_followers(username)) {
            fs.appendFileSync(filename, JSON.stringify(user) + '\n');
            total += 1;
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
