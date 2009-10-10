cd src
echo // ==UserScript== > penochka.js
echo // @name           Govno 3 aka penochka >> penochka.js
echo // @version        UnStAbLe >> penochka.js
echo // @description    Penochka imgboard script. >> penochka.js
echo // @include        http://2-ch.ru/* >> penochka.js
echo // @include        http://*.2-ch.ru/* >> penochka.js
echo // @exclude        */src/* >> penochka.js
echo // @run-at         document-start >> penochka.js
echo // ==/UserScript== >> penochka.js
type timer.js base64.js jquery.min.js jquery.cookie.js jquery.json.js jquery.imgboard.js settings.js  main.js >> penochka.js
cd ..
move src\penochka.js penochka.js