/**/

function _cake (name, val) {
   if (typeof val == 'undefined') {
      return b64decode($.cookie(name))
   } else if (val == null) {
      $.cookie(name, '', {expires: -1})
   } else {
      $.cookie(name, b64encode(val), {path: '/', expires: 9000})
   }
}

/* TO RM: This is a nasty hack so should be removed as soon
   as opera will began support localStorage 
if (window.opera) {
   var neverDomain = 'http://BAAD.F00D/';
   if (location.href == neverDomain) {
      document.addEventListener('message', function(evt) {
         var a = msg.data.split('|');
         switch (a[0]) {
         case 'get': evt.source.postMessage(getCookie(a[1]));
         case 'set': setCookie(a[1]);
         case 'del': delCookie(a[1]);
         }
      }, true);
   } else {
      $.bind('message', function (e) {
	 
      })
      document.addEventListener('message', function(evt) {
         alert('got value: '+evt.data);
      });

      document.addEventListener('DOMContentLoaded', function() {
         var iframe = document.createElement('iframe');
         iframe.style.display = 'none';
         iframe.onload = function() {
            iframe.contentWindow.postMessage('set|name|value');
            iframe.contentWindow.postMessage('get|name');
         }
         iframe.src = 'http://0.0.0.0/';
         document.documentElement.appendChild(iframe);
      }, true);
   }
}
 End of nasty hack */

function io(name, val) {
   try {
      var storage = typeof localStorage === 'object' ? localStorage : globalStorage[location.hostname]
   } catch (err) { /* Worst case: use cakes */
      return _cake(name, val)
   }
   if (typeof val == 'undefined') {
      return storage.getItem(name)
   } else if (val == null) {
      storage.removeItem(name)
   } else {
      storage.setItem(name, val)
   }
}

