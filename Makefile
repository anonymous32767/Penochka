
all: compiled

compiled:
	cd src; make;
	mv src/penochka.opera.js penochka.opera.js
	mv src/penochka.user.js penochka.user.js

clean:
	cd src; make clean
	rm -f penochka.opera.js
	rm -f penochka.user.js

build: 	
	make compiled
	git add penochka.opera.js
	git add penochka.user.js
	git commit -a -m "Build $(v)"
	git tag -a -m "$(m)" $(v)
	git push --tags github master
	make clean
	git rm -f penochka.opera.js
	git rm -f penochka.user.js
	git commit -a -m "Build $(v) cleanup."
	git push github master
tst:
	echo $(v)

privoxy.js: penochka.opera.js
	perl -MMIME::Base64 -0777 -ne "print\"\t'data:text/javascript;base64,\".encode_base64(\$$_,'').\"\',\n\"" < $< > $@
