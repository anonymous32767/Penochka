;(function () {

   function timer(f, params, message, logger) {
	  var s = (new Date).getTime()
	  var result = f.apply(this, params)
	  logger(message, ((new Date).getTime() - s))
	  return result
   }

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
			data = window.profiling 
				  ? timer(handlers[i], [data], 'Message '+ sig, function(){console.log(arguments)}) 
				  : handlers[i](data)
		 }
	  }
      return data
   }

})();