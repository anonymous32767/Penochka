/**
 * @module loader
 * @title Запуск скрипта
 * @descr Определяет момент, когда уже можно запустить скрипт
 * @depends jquery kernel
 */

/* Защита от повторного вызова скрипта. */
if ($.locked) 
	return

function ok () {
	$.timer.check('page load')
	/* Init DOM */
	$.to('domready', {e:document})
	$.timer.check('process')
	/* Finalize and send "loadad" event */
	$.locked = true
	setTimeout(function() {
      $.timer.check('async queue'); 
		$.to('loaded')
	}, 0)
}

$.to(location.hostname)
$.to('ready')
try {
   document = unsafeWindow.document; ok()
} catch (err) { $(ok) }
