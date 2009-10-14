source = header.js base64.js jquery.min.js jquery.cookie.js jquery.form.js\
	 jquery.json.js storage.js jquery.imgboard.js settings.js  main.js

all: penochka.js 

penochka.js: $(source)
	cat $^ > $@

clean:
	rm -f penochka.js
