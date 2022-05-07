import os
import sys
import csv

if (len(sys.argv) < 3):
    print(f'usage: {sys.argv[0]} <users.csv> <include.txt>')
    sys.exit(1)

_, users, include = sys.argv

# read lowercase usernames from include file
include = set(l.lower() for l in open(include).read().splitlines())

# filter csv to filter out included names
with open(users) as csvfile:
    reader = csv.DictReader(csvfile)
    writer = csv.DictWriter(sys.stdout, reader.fieldnames)
    writer.writeheader()
    for row in reader:
        # print(row)
        if (row['screen_name'].lower() in include):
            writer.writerow(row)
        else:
            sys.stderr.write(f'skipping {row["screen_name"]}\n')
