(async () => {
    const fs = require('fs');
    const moment = require('moment');
    const nodemailer = require('nodemailer');
    const config = require('./config.js');

    const from = 'Eli Finer<eli@saveoursocial.co>';
    const subject = 'Twitter audience backup';
    const template = ({name, count, link}) => `\
Hey ${name},

Here's your backup with all ${count} of your followers.

${link}

We’re going to store it for you, but you should keep a copy too.

It’s usually a good idea to load it into Google Sheets where you can filter it to find interesting nuggets.

And here's the payment link. It's $10 per 10,000 followers, so just set the quantity to ${Math.round(count / 10000)} for a total of $${Math.round(count / 10000) * 10}.

https://buy.stripe.com/4gweYl2OVeBc9skcMP

Thanks,
Eli
`

    try {
        const name = process.argv[2];
        const email = process.argv[3];
        const count = parseInt(process.argv[4]);
        const link = process.argv[5];
        const force = process.argv[6] == '--force';
        if (! (email && count && link)) {
            console.log(`usage: node notify.js <name> <email> <count> <link> [--force]`);
            process.exit(1);
        }

        var message = template({name, count, link});

        if (force) {
            console.log(`Sending to ${email}...`);
            const transporter = nodemailer.createTransport({
                host: config.SMTP.host,
                port: config.SMTP.port,
                secure: false,
                auth: {
                user: config.SMTP.user,
                pass: config.SMTP.password
                },
            });
            const info = await transporter.sendMail({
                from: from,
                replyTo: 'eli.finer@gmail.com',
                bcc: 'eli.finer+sos@gmail.com',
                to: email,
                subject: subject,
                text: message,
            });
            console.log(`Done.`);
        } else {
            console.log(`To: ${email}`);
            console.log(`Subject: ${subject}`);
            console.log();
            console.log(message);
        }

    } catch (e) {
        console.error(e);
    }
})();
