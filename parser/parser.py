#import 
import json
import re
import pprint
import csv
import exceptions

def num(s):
    try:
        return int(s)
    except exceptions.ValueError:
        return float(s)

countries = {}
files = ['gni_per_capita',  'health_expenditure', 'life_expectency', 'population', 'gdp', 'motor_vehicles_per_1k_people',
	'birth_rate', 'death_rate', 'gni_per_capita', 'gni']

print "Start parsing ... "
for currentFileName in files:
	currentFilePath = 'data_csv/' + currentFileName + '.csv'
	ifile  = open(currentFilePath, "rU")
	reader = csv.reader(ifile)

	indicator = currentFileName
	print "-------" + indicator

	rownum = 0
	print "Start parsing ... " + currentFileName
	for row in reader:

		# Save header row.
		# print "Begin ... " + str(rownum)
		if rownum == 0:
			header = row
		
		else:
			colnum = 0
			country = {}

			for col in row:
				# get or create a country object (a dictionary)
				if colnum == 0: # country name
					countryName = col

					# if countryName = World, continue
					if countryName == "World":
						break

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
					# print col
					if country.get(header[colnum]):
						aYear = header[colnum]
						year = country[aYear] # get a year object 
					else:
						# create a new year object in country
						aYear = header[colnum]
						country[aYear] = {}
						year = country[aYear]
					
					year[indicator] = col.replace(',','')
					year[indicator] = year[indicator]
					if(year[indicator]) == '..':
						year[indicator] = "NaN"
					# print '... year ... ' 
					# print year
					
				colnum = colnum + 1

		rownum = rownum + 1

	ifile.close()

print pprint.pprint(countries)

# Output format 1
# pprint.pprint(countries)
# records = []
# for countryName in countries:
# 	countryRecord = countries[countryName] 
# 	for year in countryRecord.keys():
# 		aRecord = countryRecord[year]
# 		aRecord['country'] = countryName
# 		aRecord['year'] = year
# 		records.append(aRecord)

# pprint.pprint(records)

json_data = open('data/ContinentsToCountryAbbrev.json').read()
myContinentToCountryAbbrev = json.loads(json_data)

json_data = open('data/CountryAbbrevToCountryDetail.json').read()
myCountryAbbrevToCountryDetail = json.loads(json_data)

RawCountryAbbrevToCountryName = {}
for aCountryAbbrev in myCountryAbbrevToCountryDetail.keys():
	RawCountryAbbrevToCountryName[aCountryAbbrev] = myCountryAbbrevToCountryDetail[aCountryAbbrev]['name']

RawContinentToCountires = {}
for aContinentAbbrev in myContinentToCountryAbbrev.keys():
	aContinentName = myContinentToCountryAbbrev[aContinentAbbrev]['name']

	# Map a country abbreviation name to it's real name 
	countriesInAContinent = []
	CountryAbbrevNames = myContinentToCountryAbbrev[aContinentAbbrev]['countries']
	for aCountryAbbrevName in CountryAbbrevNames:
		aCountryName =  RawCountryAbbrevToCountryName[aCountryAbbrevName]
		countriesInAContinent.append(aCountryName)
	
	RawContinentToCountires[aContinentName] = countriesInAContinent

RawCountryToContinent = {}
for aContinent in RawContinentToCountires.keys():
	countriesInAContinent = RawContinentToCountires[aContinent]
	for country in countriesInAContinent:
		RawCountryToContinent[country] = aContinent

# Output format 2
# pprint.pprint(countries)
# [{"country":"Taiwan", "region":"...", "gni":[[1800,....], [], [], .. ]  }]

json_data = open('data/ManualCountryToContinent.json').read()
myManualCountryToContinent = json.loads(json_data)

records = []
for countryName in countries:

	countryRecord = countries[countryName]
	countryStore = {} 
	for year in countryRecord.keys():
		for indicator in files:
			try:
				if countryRecord[year][indicator] != "NaN":
					anIndicatorStore = [num(year), num(countryRecord[year][indicator])]
					try:
						countryStore[indicator].append(anIndicatorStore)
					except:  # new an indicator array if first seeing this indicator
						countryStore[indicator] = []
						countryStore[indicator].append(anIndicatorStore)
			except:
				continue

	
	# sort years
	for indicator in files:
		try:
			countryStore[indicator] = sorted(countryStore[indicator],key=lambda x: x[0])
		except:
			# create a empty indicatorStore for those doesn't have anything
			# countryStore[indicator] = []
			continue	
	countryStore["country"] = countryName

	try:
		countryStore["continent"] = RawCountryToContinent[countryName]
	except:
		print countryName
		try:
			continent = myManualCountryToContinent[countryName]
			countryStore["continent"] = continent[0]
			print " check"
		except: 
			myManualCountryToContinent[countryName] = []
			continent = myManualCountryToContinent[countryName]


	records.append(countryStore)

# pprint.pprint(records)


f = open('data/ManualCountryToContinent.json', 'w')
f.write(json.dumps(myManualCountryToContinent, sort_keys=True, indent=4))
f.close()


f = open('worldbankdata2.json', 'w')
f.write(json.dumps(records, sort_keys=True, indent=4))
f.close()

allCountries = []
for record in records:
	allCountries.append(record['country'])

f = open("countries.json", "w")
f.write(json.dumps(allCountries, sort_keys=True, indent=4))
f.close()

f = open("continents.json", "w")
f.write(json.dumps(RawContinentToCountires.keys(), sort_keys=True, indent=4))
f.close()


f = open("mapCountryToContinent.json", "w")
f.write(json.dumps(RawCountryToContinent, sort_keys=True, indent=4))
f.close()

f = open("indicators.json", "w")
f.write(json.dumps(files, sort_keys=True, indent=4))
f.close()

for i in range(0, 214):
	print records[i]['country'] + "  " + allCountries[i] 

