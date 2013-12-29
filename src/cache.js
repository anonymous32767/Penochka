;(function (ρ) {
   var cache = {}
   var bad = {}

   cache[document.baseURI] = document;

   on('/r/ cache', function (data) {
      var part = document.createElement('SPAN');
      var url = data.href.split('#')[0]
      if (cache[url]) {
         data.data = cache[url]
         console.log('CACHED', url)
         return to('cache ok', data)
      }
      if (bad[url]) {
         data.wtf = 'Cache error'
         return to('fail', data)
      }
      to('pending', data)
      part.load(
         url + ' ' + data.cacheSelector,
         '',
         function (responseText, textStatus, XMLHttpRequest) {
            if (textStatus == 'timeout') {
               data.wtf = textStatus
               return to('fail', data)
            }
            if (({success:1,notmodified:1})[textStatus]) {
               cache[url] = part
            } else {
               bad[url] = true
            }
            return to('/r/ cache', data)
         })
   })
})(penochka);