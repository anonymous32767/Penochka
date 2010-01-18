buildnumfile := build
versionfile := version
target := penochka.tmp

opera_dir := $(HOME)/User\ Js/Penochka/
chrome_dir := $(HOME)/AppData/Local/Chromium/User\ Data/Default/User\ Scripts

v = 0.$$(cat $(versionfile)).$$(($$(cat $(buildnumfile)) + 1))

all: bld

install: bld
	mkdir -p $(opera_dir)
	cp -f $(target) $(opera_dir)

unstable:    $(wildcard src\*.js)
	echo $$(($$(cat $(buildnumfile)) + 1)) > $(buildnumfile)
	cd src; make;
	mv src/penochka.js tmp
	mv src/make.bat build.bat
	sed -e "s/UnStAbLe/$(v)/g" tmp > $(target)
	git commit -a
	git checkout govno
	make unstable
	git checkout master

clean:
	cd src; make clean
	rm -f penochka.js

update:
	git push github master
	git push github govno
