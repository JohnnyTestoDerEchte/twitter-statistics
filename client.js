const { TwitterApi } = require('twitter-api-v2');
const { join } = require('path');
require('dotenv').config({path: join(__dirname, '.env')});

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

module.exports = client;
