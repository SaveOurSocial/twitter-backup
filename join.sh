#!/bin/sh
echo $1
fields=$(xsv headers -j $1 | tr '\n' ',')
cp $1 temp.csv
shift
while [ "$1" ]; do
    echo $1
    echo "$(xsv join twitter_link temp.csv twitter_link $1)" > temp.csv
    shift
done
xsv sort -RNs followers temp.csv > results.csv
rm temp.csv
echo results.csv
