const client = require('./client.js');
const {GoogleSpreadsheet} = require('google-spreadsheet');

(async () => {
    try {
        const doc = new GoogleSpreadsheet('1VwglCigPTSrRlfSpOn_53CZrETIvUdDAN8l9vs-SD38')
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        });

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        const tweets = await client.v2.search('Logitech Cup', {
            "user.fields": "public_metrics",
            "tweet.fields": 'created_at',
            expansions: "author_id",
        });

        let tweetNumber = 0;

        for await (const tweet of tweets) {
            tweetNumber++;

            const users = await client.v2.users([tweet.author_id], {
                "user.fields": "public_metrics"
            });

            const date = new Date(tweet.created_at);
            const dateFormatted = date.toLocaleString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })

            const followersCount = users.data.map(user => user.public_metrics.followers_count).at(0);
            const twitterHandle = users.data.map(user => user.username).at(0);
            const isUserVerified = users.data.map(user => user.verified ? "WAHR" : "FALSCH").at(0);

            await sheet.addRow({
                '#': tweetNumber,
                'Datum': dateFormatted,
                'Twitter Handle': twitterHandle,
                'Tweet Inhalt': tweet.text,
                'Follower': followersCount,
                'Verifiziert?': isUserVerified
            })
        }
    } catch (e) {
        console.error(e);
    }
})();
