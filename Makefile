
all: compiled

compiled:
	cd src; make;
	mv src/penochka.js penochka.js

clean:
	cd src; make clean
	rm -f penochka.js

build: 	
	make compiled
	git add penochka.js
	git commit -a -m "$(m)"
	git tag -a $(v) -m "Build $(v)"
	git push --tags github master
	make clean
	git rm -f penochka.js
	git commit -a -m "Build $(v) cleanup."
	git push github master
