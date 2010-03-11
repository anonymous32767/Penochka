/**
 * @module bookmarks
 * @title Закладки
 * @descr Операции с закладкими
 * @depends header jquery ui
 */


$.on('/r/ main menu',
	  function (data) {
		  return data.concat('<!--2-->'+$.ui.msg('Закладки', 'show bookmarks'))
	  })

$.on(['/r/ thread menu', '/r/ thread menu 2'],
	  function (data) {
		  return data.concat('<!--2-->'+$.ui.msg('В закладки', 'to bookmarks'))
	  })

/* $.on(
	'domready',
	function (data) {
		if (location.pathname.match('/settings.html')) {
			$('body').append('<h1>Закладки</h1>')
			return false
		} else {
			return data
		}
	}, true) */