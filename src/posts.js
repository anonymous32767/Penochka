/**
 * @module posts
 * @title  Post deliveri service
 * @descr  Получение сообщений по ссылке
 * @depends jquery kernel
 *
 * Модуль обрабатывает события @/r/ post@ и отсылает с ответ события
 * post ok с DOMом сообщения или @fail@ с указанием того, что плохого
 * произошло.
 *
 * TODO: Описать подробнее про работу с кешем.
 */

$.on('post',
	  function (data) {
		  if (data.e.getAttribute('processed'))
			  return null
		  data.e.setAttribute('processed', '1')
		  return data
	  }, true)

$.on('/r/ post', function(data) {
   var addr = $.fixHref(data.href).split('#')
   var extracted = $('a[name='+addr[1]+']', data.ctx)[0]
   if (extracted) {
		data.id = addr[1]
		data.e = extracted
		$.to('post', data)
      $.to('post ok', data)
   } else {
      if (data.post) {
         data.wtf = $.i18n.err.post404
         return $.to('fail', data)
      } else {
         data.post = 1
         return $.to('/r/ cache', data)
      }
   }
})

$.on(
   'cache ok',
   function (data) {
      if (data.post) {
         data.ctx = data.e
         $.to('/r/ post', data)
			return null
      }
		return data
   })
