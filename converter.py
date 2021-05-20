#short script to convert DoT traffic station data into a format my javascript can parse
import io
import string

input = open("TMAS2017.sta")
out = open("stations.txt", "w+")
for i in range(0, 32000):
    line = input.readline()
    try:
        state = line[1:3]
        id = line[3:9]
        lat = line[51:53]
        latDec = line[53:59]
        lon = line[59:62]
        lonDec = line[62:68]
        out.write(state.strip() +"," + lat.strip() + "." + latDec.strip() + ",-" + lon.strip() + "." + lonDec.strip() + "\n")
    except:
        print("error on this line!")
