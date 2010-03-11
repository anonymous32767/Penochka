/**
 * @module simple-settings
 * @title Простые настройки
 * @descr Настройки в самом скрипте вместо диалога настроек
 * @depends header jquery kernel 
 */

var settings = {
	/* CSS */
	userCSS: '/css/futaba.css',  /* Дневной CSS */
	userCSS2: '/css/futaba.css', /* Ночной CSS */
	nightTime: '22:00-8:00',
	/* Форма ответа */
	hideIndex:true, 
	moveThread:true,
	fastReply:false,
	/* PostPreviews */
	raiseDelay: 100, 
	fallDelay: 100, 
	hlPreviews: true
}

function merge (storage, obj) {
	for (var i in obj) {
		if (storage[i] != undefined) {
			obj[i] = storage[i]
		}
	}
	return obj
}

$.on('/r/ cfg', 
	  function (data) {
		  return merge(settings, data)
	  })