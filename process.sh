#!/bin/bash
if [ "$1" == "" ]; then
    echo "usage $0 <username> [limit]"
    exit 1
fi

ID=`uuidgen | md5 | head -c10`
USERNAME=${1//@/}
LIMIT=$2
CSVPATH=$USERNAME-${LIMIT}followers.csv
JSONPATH=$USERNAME-${LIMIT}followers.jsonl

node user.js $USERNAME | grep -e screen_name -e followers
node followers.js $USERNAME $LIMIT
node make-csv.js $JSONPATH

gzip -f $JSONPATH
aws s3 cp $JSONPATH.gz s3://saveoursocial-production/$ID/$JSONPATH.gz
echo "https://backups.saveoursocial.co/$ID/$JSONPATH.gz"
aws s3 cp $CSVPATH s3://saveoursocial-production/$ID/$CSVPATH
NAME=there
COUNT=$(wc -l $CSVPATH | awk '{print $1}')
BACKUP_URL="https://backups.saveoursocial.co/$ID/$CSVPATH"
echo $BACKUP_URL
