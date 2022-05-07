const fs = require('fs');

// for (var i = 1; i < 30; i++) {
//     let rawdata = fs.readFileSync(`./users-page-${i}.json`);
//     let data = JSON.parse(rawdata);
//     for (let user of data.users) {
//         console.log(user.handle);
//     }
// }


// var count = 0;
// for (var i = 1; i < 30; i++) {
//     let rawdata = fs.readFileSync(`./users-page-${i}.json`);
//     let data = JSON.parse(rawdata);
//     for (let message of data.messages) {
//         if (message.html.match(/Back up your list of followers/)) {
//             count++;
//         }
//     }
// }

conversations = {}
let users = {};
for (var i = 1; i < 30; i++) {
    let rawdata = fs.readFileSync(`./users-page-${i}.json`);
    let data = JSON.parse(rawdata);
    for (let user of data.users) {
        users[user.id] = user.handle;
    }
    for (let message of data.messages) {
        conversations[message.conversationId] = conversations[message.conversationId] || [];
        conversations[message.conversationId].push({
            sender: users[message.senderId],
            recipient: users[message.recipientId],
            html: message.html,
        })
    }
}

// console.log(Object.keys(conversations).length);

count = 0;
for (var conv of Object.values(conversations)) {
    if (conv[0].html.match(/I was talking to/) && conv.length == 1) {
        console.log(conv[0].recipient);
    }
}

// console.log(count);