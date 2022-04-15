const fs = require('fs');

for (var i = 1; i < 20; i++) {
    let rawdata = fs.readFileSync(`./users-page-${i}.json`);
    let data = JSON.parse(rawdata);
    for (let user of data.users) {
        console.log(user.handle);
    }
}
