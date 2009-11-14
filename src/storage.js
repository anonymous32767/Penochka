/* Cookies mamangement instead of using plugin.
   Note that we do not escape/base64 cookies 
   values here, so take care about it's format. */
function getCookie(cName)
{
   if (document.cookie.length>0)
   {
      cStart=document.cookie.indexOf(cName + "=");
      if (cStart!=-1)
      {
         cStart=cStart + cName.length+1;
         cEnd=document.cookie.indexOf(";",cStart);
         if (cEnd == -1) 
	    cEnd=document.cookie.length
         return document.cookie.substring(cStart,cEnd);
      }
   }
   return "";
}

function setCookie(cName, value, path, expireDays)
{
   var expDate = new Date()
   expDate.setDate(expDate.getDate() + expireDays);
   document.cookie=cName+ "=" + value +
      (path ? "; path=" + path : "") +
      (expireDays ? "; expires="+expDate.toGMTString() : "")
}

function _cake (names, valfn) {
   if (typeof valfn == 'function') {
      var retVal = {}
      for (var i in names) {
        retVal[i] = b64decode(getCookie(i))
      }
      valfn(retVal)
   } else {
      var len = 0
      var encoded = {}
      for (var i in names) {
	 /* Encode value */
	 encoded[i] = b64encode(names[i][0])
	 len += encoded[i].length
      }
      if (len > 4000) /* Not 4096. Let's take a small gap*/
	 return false
      for (var i in encoded) 
	 setCookie(i, encoded[i], names[i][1], 365 * 10)
      return true
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

/* Due to imposed async nature of our cross-browser IO
   read procedure io() should be called only once to improve
   performance */
function io(names, valfn) {
   var storage = {}
   try {
      /**/
      
      /* end of workaround */
      storage = (typeof localStorage === 'object') && (localStorage != null) ? localStorage : globalStorage[location.hostname]
      if (!storage) {
	 globalStorage[location.hostname].x = 'y'
	 storage = globalStorage[location.hostname]
      }
   } catch (err) { /* Worst case: use cakes */
      return _cake(names, valfn)
   }
   if (typeof valfn == 'function') {
      var retVal = {}
      for (var i in names) {
         retVal[i] = storage.getItem(i)
      }
      valfn(retVal)
   } else {
      for (var i in names) {
	 if (!names[i][1])
	    names[i][1] = ''
         storage.setItem(i+names[i][1].replace(/\//g,''), names[i][0])
      }
      /* FIXME: Add length check, localStorage als 
         has size restrictions */
      return true
   }
}

