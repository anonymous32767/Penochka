/**
 * @module discussmap
 * @title Обратные ссылки
 * @descr Сбор и расстановка обратных ссылок (карта дискуссии).
 * @depends jquery kernel
 */

$.refmap = {}

var postrefs = []

$.on(
	'ref',
	function (data) {
		postrefs.push($.fixHref(data.e.href).split('#')[1])
	})

$.on(
	'post',
	function (data) {
		for (j = 0; j < postrefs.length; j++ ) {
			try {
				$.refmap[postrefs[j]].push(data.id)
			} catch (e) { $.refmap[postrefs[j]] = [data.id] }
		}
		postrefs = [] 
		if ($.refmap[data.id]) {
			var links = []
			for (i = 0; i < $.refmap[data.id].length; i++) {
				links.push($.ui.ref($.refmap[data.id][i]))
			}
			$(data.e).nextAll('blockquote:first').
				prepend('<small>Ссылки ' + links.join(', ')+'.</small>')
		}
		return data
	})