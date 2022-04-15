#!/bin/sh

# via solid inbox, JSESSIONID cookie needs to be taken from active session
for page in {1..20}; do
    curl 'https://app.solidinbox.com/api/inbox?q=&read=&flag=&page='${page} \
    -H 'cookie: JSESSIONID=wEiLbjBb5kCEeCBLDcODINqAFeDeCKWVnKcxuVgX' \
    --compressed > users-page-${page}.json
done
