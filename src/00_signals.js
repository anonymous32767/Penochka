(function (window) {

   var signals = {}

   window.on = function (sig, handler) {
      if (!signals[sig])
         signals[sig] = []
      signals[sig].push(handler)
   }

   window.to = function (sig, data) {
      var handlers = signals[sig] || [], i = -1
      while (handlers[++i]) {
         data = handlers[i](data)
      }
      return data
   }

   document.addEventListener('click', function (e) {
      var signame = e.target.getAttribute('msg')
      if (signame) {
         var result =  to('click:'+signame, e.target) && e
		 if (!result) {
			e.preventDefault()
			e.stopPropagation()
		 }
		 return result
	  }
      return e
   }, true)

   document.addEventListener('dbclick', function (e) {
      var signame = e.target.getAttribute('msg')
      if (signame)
         var result = to('dbclick:'+signame, e.target) && e
		 if (!result) {
			e.preventDefault()
			e.stopPropagation()
		 }
		 return result
      return e
   }, true)

})(window);