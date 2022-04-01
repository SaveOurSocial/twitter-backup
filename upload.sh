#!/bin/bash
if [ "$1" == "" ]; then
    echo "usage $0 <file>"
    exit 1
fi

ID=`uuidgen | md5 | head -c10`
aws s3 cp $1 s3://saveoursocial-production/$ID/$1
echo
echo "https://backups.saveoursocial.co/$ID/$1"

