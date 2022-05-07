import os
import sys
import csv

if (len(sys.argv) < 3):
    print(f'usage: {sys.argv[0]} <users.csv> <exclude.txt>')
    sys.exit(1)

_, users, exclude = sys.argv

# read lowercase usernames from exclude file
exclude = set(l.lower() for l in open(exclude).read().splitlines())

# filter csv to filter out excluded names
with open(users) as csvfile:
    reader = csv.DictReader(csvfile)
    writer = csv.DictWriter(sys.stdout, reader.fieldnames)
    writer.writeheader()
    for row in reader:
        # print(row)
        if (row['screen_name'].lower() in exclude):
            sys.stderr.write(f'skipping {row["screen_name"]}\n')
        else:
            writer.writerow(row)
