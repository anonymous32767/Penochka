;(function (ρ) {

   function setupProxy(browserEvent, triggerAttribute, rawEventPass, prefixName, asigname) {

	  prefixName = prefixName || browserEvent

	  document.addEventListener(browserEvent, function (e) {
		 var signame = asigname || e.target.getAttribute(triggerAttribute)
		 if (e.target.getAttribute(triggerAttribute)) {
			var result =  to(prefixName + ':' + signame, rawEventPass ? e : e.target) && e
			if (!result) {
			   e.preventDefault()
			   e.stopPropagation()
			}
			return result
		 }
		 return e
	  }, true)
  
   }


   setupProxy('click', 'msg', false);
   setupProxy('dbclick', 'msg', false);

   setupProxy('click', 'href', false, 'href', 'click');

   setupProxy('change', 'msg', true);

   setupProxy('mouseover', 'msg', true);
   setupProxy('mouseout', 'msg', true);

   on('frontend', function (data) {
   	  ρ.locked = true;
   	  data.source.documentElement.innerHTML = data.rendered;
   	  // FUKING MAZAFAKING BUGG!!!!
   	  data.source.onload(function () { ρ.locked = false; });
	  return 'ok'
   })

   async_on('ajat', function (data, ret) {
	  var xhr = new XMLHttpRequest(), tm = null;
	  if (data.timeout) 
		 tm = setTimeout(function () {
			data.err = 'timeout'
			ret(data)
		 }, data.timeout)
      xhr.open("GET", data.href, true );
      xhr.onreadystatechange = function () {
         if (xhr.readyState == 4 && xhr.status == 200) {
			clearTimeout(tm)
			data.err = 'ok'
			data.text = xhr.responseText
			ret(data)
         }
      };
      xhr.send(null);
   })

   async_on('ajaj', function (data, ret) {
	  async_to('ajat', data, function (data) {
		 if (data.err == 'ok') {
			data.json =  JSON.parse(data.text)
			ret(data)
		 } else {
			ret(data)
		 }
	  })
   })

})(penochka);