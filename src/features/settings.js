/**
 * @module settings
 * @title Диалог настроек
 * @descr Генерация диалога настроек и обработка всего, что с ним свазано.
 * @depends jquery kernel ui
 */

$.on('/r/ main menu',
	  function (data) {
		  return data.concat('<!--1-->'+$.ui.msg('Настройки', 'show settings'))
	  })