/**
 * @module css
 * @title Работа с CSS
 * @descr Настройка вида с помощью CSS при инициализации и в последующем.
 * @depends header kernel jquery
 */

/* Найтройки модуля */
var cfg = {userCSS: '/css/futaba.css', userCSS2: '/css/futaba.css',  nightTime: '22:00-8:00'}

$.on(
	'/r/ settings',
	function (settings) {
		return settings.concat([
			{idx: 'userCSS', name: 'Тема оформления', 
			 group: 'interface', valobj: cfg},
			{idx: 'userCSS2', name: 'Ночная Тема оформления', 
			 group: 'interface', valobj: cfg},
			{idx: 'nightTime', name: 'Ночной интервал', 
			 group: 'interface', valobj: cfg}
		])
	}) 

/* Расширяем jQuery методом добавления глобального CSS */
$.extend({
   css: function (css) {
      var style = document.createElement( 'style' );
      style.type = 'text/css';
      var head = document.getElementsByTagName('head')[0];
      head.appendChild( style );
      if( style.styleSheet )  /* IE */
         style.styleSheet.cssText = css;
      else  /* other browsers */
         style.appendChild( document.createTextNode(css) );
      return style;
   }
})


/* Основная часть модуля - собираем весь CSS что сможем 
   и добавляем его при старте*/
var globalCSS = ' ';
var selectedCSS = null;
$.userCSS = {none:' '}

function isNight (interval) {
	var dt = new Date;
	var h = dt.getHours(),
	m = dt.getMinutes(),
	thm = interval.match(/(\d+)\D+(\d+)\D+(\d+)\D+(\d+)/)
   return !(((thm[3] < h) && (thm[1] > h)) ||
			  ((thm[3] == h) && (thm[4] < m)) ||
			  ((thm[1] == h) && (thm[2] > m)))
}

$.on(
	'ready',
	function (data) {
		cfg = $.to('/r/ cfg', cfg)
		var selCSS = (isNight(cfg.nightTime) ? 'userCSS2' : 'userCSS')
		globalCSS = $.to('css', globalCSS)
		if ($.userCSS[cfg[selCSS]]) {
			globalCSS +=  $.userCSS[cfg[selCSS]]
			selectedCSS = ' '
		} else {
			selectedCSS = cfg[selCSS]
		}
		return data
	})

$.on(
	'domready',
	function (data) {
		if (selectedCSS) {
			$('link[rel=stylesheet]').attr('href', selectedCSS)
		}
		$.css(globalCSS)
		return data
	}, true)