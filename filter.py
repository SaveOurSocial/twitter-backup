import csv

with open('dvassallo-followers.csv') as csvfile:
    with open('dvassallo-large.csv', 'w') as outfile:
        reader = csv.DictReader(csvfile)
        writer = csv.DictWriter(outfile, reader.fieldnames)
        for row in reader:
            if (int(row['followers_count']) > 10000):
                writer.writerow(row)

