(async () => {
  try {
    require('dotenv').config();
    const twitter = require('./twitter.js');
    const fs = require('fs');

    async function bulk_followers(username) {
      var total = 0;
      var cursor = -1;
      while(true) {
        // rate limit: 15 requests per 15 minutes - delay 1 minute
        var ids = await twitter.follower_ids(username, cursor);
        const PAGE = 100;
        for (var index = 0; index < ids.ids.length; index += PAGE) {
          var users = await twitter.users_lookup(ids.ids.slice(index, index + PAGE));
          for (var user of users) {
            fs.appendFileSync(`bulk-${username}.txt`, JSON.stringify(user) + '\n');
          }
          total += users.length;
          console.log(`Written ${total} users.`);
          // wait 3 seconds (300 request per 15 minutes is 1 per 3 seconds)
          await new Promise(r => setTimeout(r, 3*1000));
        }

        if (! ids.next_cursor) break;
        cursor = ids.next_cursor;
      }
    }

    await bulk_followers('arvidkahl');

    } catch (e) {
      console.error(e);
}
})();
