target := penochka.js

opera_dir := $(HOME)/User\ Js/Penochka
chrome_dir := $(HOME)/AppData/Local/Chromium/User\ Data/Default/User\ Scripts

all: compiled

install: compiled
	mkdir -p $(opera_dir)
	mkdir -p $(chrome_dir)
	cp -f $(target) $(opera_dir)
	cp -f $(target) $(chrome_dir)/penochka.user.js

compiled: 
	cd src; make;
	mv src/penochka.js $(target)
	mv src/make.bat make.bat

clean:
	cd src; make clean
	rm -f penochka.js

build: 	
	make compiled
	sed -e 's/UnStAbLe/$(v)/g' penochka.js > penochka1.js
	mv penochka1.js penochka.js
	git add penochka.js
	git commit -a -m "$(m)"
	git tag -a $(v) -m "Build $(v)"
	git push --tags github master
	make clean
	git rm -f penochka.js
	git commit -a -m "Build $(v) cleanup."
	git push github master
