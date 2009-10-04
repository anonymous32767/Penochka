source = timer.js base64.js jquery.min.js jquery.cookie.js jquery.json.js\
	 jquery.imgboard.js settings.js  main.js

all: penochka.js 

penochka.js: $(source)
	echo "// ==UserScript==" > $@
	echo "// @name           Govno 3 aka penochka" >> $@
	echo "// @version	 " >> $@
	echo "// @description    Penochka imgboard script." >> $@
	echo "// @include        http://2-ch.ru/*" >> $@
	echo "// @include        http://*.2-ch.ru/*" >> $@
	echo "// @exclude        */src/*" >> $@
	echo "// @run-at         document-start" >> $@
	echo "// ==/UserScript==" >> $@
	cat $^ >> $@

clean:
	rm -f penochka.js
