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
	git commit -a -m "Build $(v)"
	git tag -a -m "Build $(v). $(m)" $(v)
	git push --tags github master
	make clean
	git commit -a -m "Build $(v) cleanup."
	git push github master
tst:
	echo $(v)
