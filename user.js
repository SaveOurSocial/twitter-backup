(async () => {
    const fs = require('fs');
    const moment = require('moment');
    const twitter = require('./twitter.js');

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
        // add last status date
        item.last_tweeted = '';
        if (item.status) {
            item.last_tweeted = moment(item.status.created_at, 'ddd MMM DD HH:mm:ss +ZZ YYYY').format('YYYY-MM-DD HH:mm:ss');
        }
        // rename fields
        item.tweets = item.statuses_count
        item.followers = item.followers_count
        item.following = item.friends_count
        return item;
    }

    try {
        const username = process.argv[2];
        if (! username) {
            console.log(`usage: node user.js <username>`);
            process.exit(1);
        }
        const fields = ['name', 'twitter_link', 'screen_name', 'location', 'url', 'followers', 'following', 'tweets', 'description', 'last_tweeted'];

        var users = await twitter.user(username);
        if (! users.length) {
            console.log(`error: user ${username} not found`);
            process.exit(1);
        }
        var user = tranform_record(users[0]);
        for (var field of fields) {
            console.log(`${field.padEnd(15)} ${user[field]}`);
        }
        // console.log(await twitter.user(username));
    } catch (e) {
        console.error(e);
    }
})();
