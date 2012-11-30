#import 
import json
import re
import pprint
import csv

countries = {}
files = ['gni', 'health_expenditure', 'life_expectency']

print "Start parsing ... "
for currentFileName in files:
	currentFilePath = 'data_csv/' + currentFileName + '.csv'
	ifile  = open(currentFilePath, "rU")
	reader = csv.reader(ifile)

	indicator = currentFileName

	rownum = 0
	print "Start parsing ... " + currentFileName
	for row in reader:

		# Save header row.
		print "Begin ... " + str(rownum)
		if rownum == 0:
			header = row
		
		else:
			colnum = 0
			country = {}

			for col in row:
				# get or create a country object (a dictionary)
				if colnum == 0: # country name
					countryName = col
					if countries.get(countryName):
						country = countries.get(countryName)

					# see if the country is already in countries {}
					# if it is, get the dictionary { '1993': {}, '1994': {} ... }
					# else, use the default empty country object
					else:
						# new a country to the countires object
						countryName = col
						countries[countryName] = {}

						# get that country object
						country = countries[countryName]
					# print "... country name ... " 
					# print countryName

				else: # year
					# see if the year is already in the country dictionary
					# if it is, get the dictionary 
					# ( i.e, we get an object 'country name, year') now 
					# else, create a new dictionary
					print col
					if country.get(header[colnum]):
						aYear = header[colnum]
						year = country[aYear] # get a year object 
					else:
						# create a new year object in country
						aYear = header[colnum]
						country[aYear] = {}
						year = country[aYear]
					
					year[indicator] = col.replace(',','')
					if(year[indicator]) == '..':
						year[indicator] = "NaN"
					# print '... year ... ' 
					# print year
					
				colnum = colnum + 1

		rownum = rownum + 1

	ifile.close()


# pprint.pprint(countries)

records = []
for countryName in countries:
	countryRecord = countries[countryName] 
	for year in countryRecord.keys():
		aRecord = countryRecord[year]
		aRecord['country'] = countryName
		aRecord['year'] = year
		records.append(aRecord)

pprint.pprint(records)

f = open('worldbankdata.json', 'w')
f.write(json.dumps(records, sort_keys=True, indent=4))
f.close()




