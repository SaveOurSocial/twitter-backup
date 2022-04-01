const Twitter = require('twitter');
const moment = require('moment');
const config = require('./config.js');
const limiter = require('limiter');
const needle = require('needle');

var client = new Twitter(config.TwitterAuth[0]);

async function tweet(status) {
    return client.post('statuses/update', {status});
}

async function show(id) {
    return client.get('statuses/show', {id});
}

async function search({q, since_id, result_type, count, max_id}) {
    return client.get('search/tweets', {q, since_id, result_type, count, max_id});
}

async function users_search(q) {
    return client.get('users/search', { q });
}

async function favorites() {
    return client.get('favorites/list', { count: 200 });
}

async function followers(user, cursor) {
    return client.get('followers/list', { screen_name: user, count: 200, cursor: cursor });
}

async function follower_ids(user, cursor) {
    return client.get('followers/ids', { screen_name: user, count: 5000, cursor: cursor, stringify_ids: true });
}

async function friend_ids(user, cursor) {
    return client.get('friends/ids', { screen_name: user, count: 5000, cursor: cursor, stringify_ids: true });
}

async function users_lookup(user_ids) {
    return client.get('users/lookup', { user_id: user_ids.join(','), include_entities: true });
}

async function user(screen_name) {
    return client.get('users/lookup', { screen_name: screen_name, include_entities: true });
}

async function friendship(user) {
    return client.get('friendships/show', { target_screen_name: user });
}

async function self_favorites() {
    var results = await favorites();
    return results.filter(v => v.user.screen_name == process.env.USERNAME);
}

async function retweet(id) {
    return client.post('statuses/retweet/' + id, {});
}

async function unretweet(id) {
    return client.post('statuses/unretweet/' + id, {});
}

async function timeline(user, count) {
    return client.get('statuses/user_timeline', { screen_name: user, count: count || 10, exclude_replies: true, include_rt: false });
}

async function hours_since_last_post(user) {
    var tweets = await timeline(user, 1);
    if (! tweets.length) return 99999;
    var created_at = moment(tweets[0].created_at, "ddd MMM DD HH:mm:ss ZZ YYYY");
    return moment().diff(created_at, 'hours');
}

async function find_root_tweet(id) {
    var tweet;
    while (true) {
        console.log(id);
        tweet = await twitter.show(id);
        if (! tweet.in_reply_to_status_id_str) break;
        id = tweet.in_reply_to_status_id_str;
    }
    return tweet;
}

async function get_replies(tweet) {
    var max_id = null;
    while (true) {
        var raw = await twitter.search({
            q: `to:${tweet.user.screen_name}`,
            since_id: tweet.id,
            result_type: 'recent',
            count: 100,
            max_id: max_id
        });
        var replies = [];
        for (var candidate of raw.statuses) {
            if (candidate.in_reply_to_status_id_str === tweet.id_str) {
                    replies.push(candidate);
            }
        }
        if (! raw.search_metadata.next_results) break;
        max_id = raw.search_metadata.next_results.match(/max_id=([0-9]+)/)[1];
    }
    return replies;
}

async function* bulk_followers(username) {
    // rate limiter (15 requests per 15 minutes)
    follower_ids_limiter = new limiter.RateLimiter({ tokensPerInterval: 15-1, interval: 15*60*1000 });
    // use multiple Twitter clients in parallel
    clients = config.TwitterAuth.map((settings) => new Twitter(settings));
    clients.forEach((client) => {
        // separate rate limiter per Twitter client (300 requests per 15 minutes)
        client.users_lookup_limiter = new limiter.RateLimiter({ tokensPerInterval: 300-1, interval: 15*60*1000 });
    });
    var client_index = 0;
    var cursor = -1;
    while(true) {
        await follower_ids_limiter.removeTokens(1);
        var ids = await follower_ids(username, cursor);
        const pagesize = 100;
        for (var index = 0; index < ids.ids.length; index += pagesize) {
            await clients[client_index].users_lookup_limiter.removeTokens(1);
            var users = await clients[client_index].get('users/lookup', {
                user_id: ids.ids.slice(index, index + pagesize).join(','),
                include_entities: true
            });
            for (var user of users) {
                yield user;
            }
            // switch Twitter client to reduce rate limits
            client_index = (client_index + 1) % clients.length;
        }
        if (! ids.next_cursor) break;
        cursor = ids.next_cursor;
    }
}

async function* bulk_friends(username) {
    // use multiple Twitter clients in parallel
    clients = config.TwitterAuth.map((settings) => new Twitter(settings));
    var client_index = 0;
    var cursor = -1;
    while(true) {
        var ids = await friend_ids(username, cursor);
        const pagesize = 100;
        for (var index = 0; index < ids.ids.length; index += pagesize) {
            var users = await clients[client_index].get('users/lookup', {
                user_id: ids.ids.slice(index, index + pagesize).join(','),
                include_entities: true
            });
            for (var user of users) {
                yield user;
            }
            // switch Twitter client to avoid rate limits
            client_index = (client_index + 1) % clients.length;
        }
        if (! ids.next_cursor) break;
        cursor = ids.next_cursor;
    }
}

async function* liking_users(tweet_id) {
    const endpointURL = `https://api.twitter.com/2/tweets/${tweet_id}/liking_users`;
    const token = config.TwitterV2Auth.bearer_token;

    const params = {
        'user.fields': 'created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld',
    };

    const res = await needle('get', endpointURL, params, {
        headers: {
            'User-Agent': "twitter-backup",
            authorization: `Bearer ${token}`
        },
    });

    if (res.body) {
        for (var item of res.body.data) {
            // compat with v1 results
            item.followers_count = item.public_metrics.followers_count;
            item.friends_count = item.public_metrics.following_count;
            item.statuses_count = item.public_metrics.tweet_count;
            item.screen_name = item.username;
            yield item;
        }
    } else {
        throw new Error('Unsuccessful request: ' + res.body);
    }
}

module.exports = {
    tweet,
    show,
    search,
    users_search,
    favorites,
    followers,
    follower_ids,
    friend_ids,
    users_lookup,
    user,
    friendship,
    self_favorites,
    retweet,
    unretweet,
    timeline,
    hours_since_last_post,
    find_root_tweet,
    get_replies,
    bulk_followers,
    bulk_friends,
    liking_users,
};
