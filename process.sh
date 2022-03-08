#!/bin/bash
if [ "$1" == "" ]; then
    echo "usage $0 <username>"
    exit 1
fi

node followers.js $1
node make-csv.js $1-followers.txt

FILEPATH=$1-followers.csv
ID=`uuidgen | md5 | head -c10`
BASENAME=`basename $FILEPATH`

aws s3 cp $FILEPATH s3://saveoursocial-production/$ID/$BASENAME

echo
echo "https://backups.saveoursocial.co/$ID/$BASENAME"
