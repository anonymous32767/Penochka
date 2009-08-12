
MINJAR = java -jar yuicompressor-2.4.2.jar

JQ = jquery.js
JQ_MIN = jquery.min.js

all: min

min:
	$(MINJAR) ${JQ} > ${JQ_MIN}

clean:
	rm -f ${JQ_MIN}