source = header.js css.js i18n.js base64.js jquery.min.js jquery.form.js\
	 storage.js jquery.imgboard.js settings.js main.js

mkbat = make.bat.tmp

all: penochka.js make.bat

penochka.js: $(source)
	cat $^ > $@

make.bat:
	cat $(mkbat) | sed 's/SoUrCeCoDe/$(source)/' > make.bat

clean:
	rm -f penochka.js
