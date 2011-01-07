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
      var signame = e.target.getAttribute('sig')
      if (signame)
         return to(signame, e.target) && e
      return e
   }, true)

   document.addEventListener('dbclick', function (e) {
      var signame = e.target.getAttribute('sig_dbl')
      if (signame)
         return to(signame, e.target) && e
      return e
   }, true)

})(window);