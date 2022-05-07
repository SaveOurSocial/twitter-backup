#!/bin/sh

# via solid inbox, JSESSIONID cookie needs to be taken from active session
for page in {1..30}; do
    curl 'https://app.solidinbox.com/api/inbox?q=&read=&flag=&page='${page} \
    -H 'cookie: JSESSIONID=SkFAfXUH3JWlAsRcSnyPN8vFxFKnvc8u8YM-egHq' \
    --compressed > users-page-${page}.json
done
