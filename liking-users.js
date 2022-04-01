(async () => {
    try {
        const fs = require('fs');
        const twitter = require('./twitter.js');

        const tweet_id = process.argv[2];

        if (! tweet_id) {
            console.log(`usage: node liking-users.js <tweet-id>`);
            process.exit(1);
        }

        // var result = await twitter.liking_users(tweet_id);

        // console.log(result);

        var total = 0;
        const filename = `${tweet_id}-liking-users.jsonl`;
        console.log(`writing to ${filename}...`);
        if (fs.existsSync(filename)) {
            fs.truncateSync(filename);
        }
        for await (var user of twitter.liking_users(tweet_id)) {
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
