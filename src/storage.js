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
      (!value | expireDays ? "; expires=" + (value ? expDate.toGMTString() : "Thu, 01 Jan 1970 00:00:00 GMT") : "")
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

/* Due to imposed async nature of our cross-browser IO
   read procedure io() should be called only once to improve
   performance */
function io(names, valfn) {
   var storage = {}
   try {
      /* end of workaround */
      storage = (typeof localStorage === 'object') && (localStorage != null) ? localStorage : globalStorage[location.hostname]
      if (!storage) {
	 globalStorage[location.hostname].x = 'y'
	 storage = globalStorage[location.hostname]
      }
   } catch (err) {       
      try {
	//return opera_io(names, valfn)
	return _cake(names, valfn)
      } catch (errr) { /* Worst case: use cakes */
	return _cake(names, valfn)
      }
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

