/**
 * @module unfolding
 * @title  Раскрытия
 * @descr  Раскрытие обрезанных сообщений, свернутых тредов.
 * @depends jquery kernel cache posts
 */

$.on(
	'click',
	function (data) {
		var subj = $(data.e)
		if (subj.is('a') && subj.closest('div.abbrev').length) {
			data.full = subj.pst()
			data.href = $.fixHref(data.e.href)
         $.to('/r/ cache', data)
			return false
		} else {
			return data
		}
	})

$.on(
	['/r/ thread menu', '/r/ thread menu 2'],
	function (data) {
		return data.concat('<!--1a-->'+$.ui.msg('Развернуть', 'unfold thread'))
	})

$.on(
   'cache ok',
   function (data) {
      if (data.full) {
         data.ctx = data.e
         $.to('/r/ post', data)
      }
		return data
   })

$.on(
   'post ok',
   function (data) {
      if (data.full) {
         var cloned = $(data.e).pst().find('blockquote:first').clone()
         data.full.find('blockquote:first').
				replaceWith(cloned)
      }
   })
