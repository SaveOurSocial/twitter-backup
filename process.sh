#!/bin/bash
if [ "$1" == "" ]; then
    echo "usage $0 <username>"
    exit 1
fi

ID=`uuidgen | md5 | head -c10`
NAME=$1
CSVPATH=$NAME-followers.csv
JSONPATH=$NAME-followers.jsonl

# node followers.js $NAME
# node make-csv.js $JSONPATH

gzip $JSONPATH
aws s3 cp $JSONPATH.gz s3://saveoursocial-production/$ID/$JSONPATH.gz
echo
echo "https://backups.saveoursocial.co/$ID/$JSONPATH.gz"

aws s3 cp $CSVPATH s3://saveoursocial-production/$ID/$CSVPATH
echo
echo "https://backups.saveoursocial.co/$ID/$CSVPATH"

