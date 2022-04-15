#!/bin/bash
if [ "$1" == "" ]; then
    echo "usage $0 <username>"
    exit 1
fi
NAME=$1
aws s3 ls --recursive s3://saveoursocial-production/ |\
    grep $NAME-followers.csv |\
    awk '{print $1 " " $2 " https://backups.saveoursocial.co/"$4}'
