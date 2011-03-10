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
	  var a = arguments.length - 1, data = arguments[a], sig = ''
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

   var async_signals = {}

   window.async_on = function (sig, handler) {
      if (!async_signals[sig])
         async_signals[sig] = []
      async_signals[sig].push(handler)
   }

   window.async_to = function () {
	  var args = arguments

	  var a = args.length - 2, data = args[a], retproc = args[a+1] || function () {}

	  var pipe_next = function (data) {
		 var sig = args[--a]
		 if (sig[0] == '.')
			sig = data[sig.slice(1)]
		 var handlers = async_signals[sig] || [], i = -1
		 var next = function (data) {
			if (handlers[++i])
			   return handlers[i](data, next)
			if (a > 0)
			   return pipe_next(data)
			else
			   return retproc(data)
		 }
		 next(data)
	  }
	  pipe_next(data)
   }

})();