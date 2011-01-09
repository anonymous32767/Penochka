(function (window) {

   var signals = {}

   window.on = function (sig, handler) {
      if (!signals[sig])
         signals[sig] = []
      signals[sig].push(handler)
   }

   window.to = function () {
	  if (arguments.length == 1) {
		 arguments.length = 2
		 arguments[1] = this
	  }
	  var a = arguments.length - 1, data = arguments[a], sig
	  while (sig = arguments[--a]) {
		 if (sig[0] == '.')
			sig = data[sig.slice(1)]
		 var handlers = signals[sig] || [], i = -1
		 while (handlers[++i]) {
			data = handlers[i](data)
		 }
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