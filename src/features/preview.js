/**
 * @module preview
 * @title  Превью сообщений
 * @descr  Генерация превью сообщений при наведении на ссылку (раньше
 * называлось intelliSense).
 * @depends jquery kernel evproxy cache posts
 *
 * TODO: Обрабатываемые события, быстродействие, геометрия.
 */

var cfg = {raiseDelay: 100, fallDelay: 100, hlPreviews: true}

function showPreview(what, x, y) {
   if (document.body.clientWidth - x < 420) {
      x = document.body.clientWidth - 500
   }
   what.attr(
      'style',
      'position:absolute; top:' + y +
         'px; left:' + x +
         'px; max-width: ' + (document.body.clientWidth - x - 10) + 'px').
      appendTo('body')
}

$.on(
   'post ok',
   function (data) {
      if (data.preview) {
         $('.penPreviewTmp').remove()
         var cloned = $(data.e).pst().preview().clone()
         cloned.addClass('penPreview '+$.iom.css.preview)
			if (cfg.hlPreviews) {
				cloned.addClass($.iom.css.highlight)
			}
         showPreview(
            cloned,
            data.preview.x,
            data.preview.y)
			return null
      }
		return data
   })

var t = null

$.on(
   'mouseover',
   function (data) {
      var subj = $(data.e)
      if (subj[0].tagName && subj[0].tagName == 'A' &&
          subj.is('a:contains("' + $.iom.ref +'")')) {
         clearTimeout(t)
         t = setTimeout(
            function () {
               $.to('/r/ post', {href: subj.attr('href'), ctx: document,
                                 preview: {x: data.event.pageX, y: data.event.pageY}})
            }, cfg.raiseDelay)
         data.event.stopPropagation()
         return null
      } if (subj.closest('.penPreview').length) {
         clearTimeout(t)
      } else {
         return data
      }
   })

$.on(
   'mouseout',
   function (data) {
      var subj = $(data.e)
      if ((subj[0] && subj[0].tagName == 'A' &&
           subj.is('a:contains("' + $.ss.refsep + '")'))
          || subj.closest('.penPreview')) {
         clearTimeout(t)
         t = setTimeout(
            function () {
               $('.penPreview, .penPreviewTmp').remove()
            }, cfg.fallDelay)
         data.event.stopPropagation()
         return false
      } else {
         return data
      }
   })

$.on(
	'ready',
	function (data) {
		cfg = $.to('/r/ cfg', cfg)
		return data
	})

