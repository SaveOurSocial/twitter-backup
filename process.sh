#!/bin/sh
if [ $1 == "" ]; then
    echo "usage $0 <username>"
    exit 1
fi
node followers.js $1
node make-csv.js $1-followers.txt
curl --http1.1 --progress-bar --upload-file $1-followers.csv https://transfer.sh | cat
echo
