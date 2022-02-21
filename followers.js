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
    const filename = `${username}-followers.txt`;
    console.log(`writing to ${filename}...`);
    for await (var user of twitter.bulk_followers('finereli')) {
      fs.appendFileSync(filename, JSON.stringify(user) + '\n');
      total += 1;
      if (total % 100 == 0) {
        console.log(`written ${total}`);
      }
    }

  } catch (e) {
    console.error(e);
  }
})();
