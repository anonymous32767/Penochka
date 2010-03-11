/**
 * @module cache
 * @title  Кэш
 * @descr  Хранилище страничек, загруженных ajaxом.
 * @depends jquery kernel
 *
 * Кэш обрабатывает событие @/r/ cache@ , где ему передается url
 * странички, которую требуется закэшировать в параметре @href@ . В
 * случае если страница уже в кэше посылается событие @cache ok@ с DOMом
 * страницы в  параметре @data@ . В случае если страницы нет в кэше, кэш
 * сразу посылает  событие @pending@, а потом начинает ее загрузку
 * аяксом. По окончании загрузки опять таки посылается событие @cache
 * ok@ c DOMом страницы.
 *
 * В случае неудачи при загрузке страницы кэш добавляет её url с список
 * плохих (переменная @bad@ ) и отсылает событие @fail@ с указанием
 * причины. В последствии если запрашиваемая страницы уже содержится в
 * списке плохих. Повторный запрос не делается и сообщение о провале
 * высылается сразу.
 *
 * Особенностью является обработка страниц, не загруженных по причине
 * таймаута. В этом случае сообщение @fail@ высылается, однако страница
 * в список плохих не добавляется, мало ли, вдруг все таки загрузится.
 */

var cache = {}
var pending = {}
var bad = {}

$.on('/r/ cache', function (data) {
   var part = $('<span/>')
   var url = data.href.split('#')[0]
	if (pending[url]) {
		/* Now simply drop but this is a
		 bit incorrect */
		return data
	}
   if (cache[url]) {
      data.e = cache[url]
      return $.to('cache ok', data)
   }
   if (bad[url]) {
      data.wtf = $.i18n.err.cache
      return $.to('fail', data)
   }

	pending[url] = 1
	$.to('pending', {
		nid: url, 
		wtf: $.i18n.notify.thrdLoading.
			replace('%t%', url.match(/(\d+)\D+$/)[1])
	})

   part.load(
      url + ' ' + $.iom.cache,
      function (responseText, textStatus, XMLHttpRequest) {
			delete pending[url]
			$.to('pending ok', {nid: url})
         if (textStatus == 'timeout') {
            data.wtf = textStatus
            return $.to('fail', data)
         }
         if (({success:1,notmodified:1})[textStatus]) {
            cache[url] = part[0]
         } else {
            bad[url] = true
         }
         return $.to('/r/ cache', data)
      })
})
