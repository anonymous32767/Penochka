/**
 * @module evproxy
 * @title Прокси событий
 * @descr Мост между родными событиями браузера и сигнальной
 * системой пеночки.
 */

$.on('click',
     function (data) {
		  var msg =  data.e.getAttribute('msg')
        if (msg) {
           $.to(msg, {e: data.e, event: data.event})
           return null
        }
        return data
     }, true)

$.on('domready',
     function (data) {
        $(document).click(
           function (e) {
              var ret = $.to('click', {e: e.target, event:e})
              if (!ret) {
                 e.preventDefault()
                 e.stopPropagation()
              }
              return ret
           })

        var evOver =
           function (e) {
              return $.to('mouseover', {e: e.target, event:e})
           }
        var evOut =
           function (e) {
              return $.to('mouseout',  {e: e.target, event:e})
           }

        if (document.attachEvent) {
           document.attachEvent('onmouseover', evOver)
           document.attachEvent('onmouseout', evOut)
        } else {
           document.addEventListener('mouseover', evOver, true)
           document.addEventListener('mouseout', evOut, true)
        }
        return data
     })
