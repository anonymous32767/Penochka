source = jquery.min.js jquery.cookie.js jquery.json.js\
	 jquery.imgboard.js settings.js penochka.js

hex = $(source:.js=.jsb64)

all: opera firefox

firefox: penochka.user.js
opera: penochka.cat.js

jq:
	cd jquery; make
	cp jquery/jquery.min.js .

penochka.cat.js: $(source)
	cat $^ > $@

penochka.user.js: $(hex)
	echo "// ==UserScript==" > $@
	echo "// @name           Govno 3 aka penochka" >> $@
	echo "// @version	 " >> $@
	echo "// @description    Govno. Rewrited." >> $@
	echo "// @include        http://2-ch.ru/*" >> $@
	echo "// @include        http://*.2-ch.ru/*" >> $@
	echo "// @exclude        */src/*" >> $@
	echo "// ==/UserScript==" >> $@
	echo "hex = [" >> $@
	cat $? >> $@
	echo "''];h=document.getElementsByTagName('head')[0];var e;for(var i in hex){e=document.createElement('script');e.type='text/javascript';e.src=hex[i];h.appendChild(e);}" >> $@
	rm -f *.jsb64

%.jsb64: %.js
	perl -MMIME::Base64 -0777 -ne "print\"\t'data:text/javascript;base64,\".encode_base64(\$$_,'').\"\',\n\"" < $< > $@

clean:
	rm -f *.jsb64
	rm -f penochka.user.js penochka.cat.js
	rm -rf distr

distr:
	make clean
	mkdir -p distr/opera
	mkdir -p distr/ffox
	mkdir -p distr/src
	make
	cp $(source) Makefile distr/src
	cp penochka.user.js distr/ffox
	cp penochka.cat.js distr/opera
	cd distr; tar cjf penochka.tar.bz2 *
	mv distr/*.tar.bz2 .