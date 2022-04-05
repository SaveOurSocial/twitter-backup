#!/bin/bash
if [ "$1" == "" ]; then
    echo "usage $0 <username>"
    exit 1
fi
NAME=$1
aws s3 ls --recursive s3://saveoursocial-production/ | grep $NAME | awk '{print $4}' | \
    while read line; do echo "https://backups.saveoursocial.co/$line"; done
