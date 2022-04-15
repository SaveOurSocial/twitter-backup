(async () => {
    const fs = require('fs');
    const template = require('es6-template');
    const csv = require('csv/sync');
    const twitter = require('./twitter.js');
    const _ = require('lodash');

    function computePrice(followerCount) {
        return Math.max(10, Math.round(followerCount / 10000) * 10);
    }

    function getName(name) {
        names = name.split(/\s+/);
        if (names.length == 2 && names[0].match(/[a-zA-Z]+/)) {
            return names[0][0].toUpperCase() + names[0].substring(1).toLowerCase();
        }
        return 'there';
    }

    try {
        const usersFile = process.argv[2];
        const templateFile = process.argv[3];
        const excludeFile = process.argv[4];
        if (! usersFile || ! templateFile) {
            console.log(`usage: node bulk-dm.js <users.csv> <template.txt> [exclude.txt]`);
            process.exit(1);
        }
        var messageTemplate = template.compile(fs.readFileSync(templateFile).toString());
        var rows = csv.parse(fs.readFileSync(usersFile));
        var exclude = [];
        if (excludeFile) {
            exclude = fs.readFileSync(excludeFile).toString().split(/\n/);
        }
        headers = rows[0];
        rows.shift();
        for (var row of rows) {
            var user = _.zipObject(headers, row);
            if (exclude.includes(user.screen_name)) {
                console.log(`skipping ${user.screen_name}`)
            }
            // console.log(user.name, ' - ', getName(user.name));

            var message = messageTemplate({
                name: getName(user.name),
                count: parseInt(user.followers).toLocaleString(),
                price: computePrice(parseInt(parseInt(user.followers))).toLocaleString(),
            });

            // console.log(message);
        }
    } catch (e) {
        console.error(e);
    }
})();
