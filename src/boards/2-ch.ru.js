/**
 * @module 2-ch
 * @title Поддержка сайта 2-ch.ru
 * @depends kernel wakaba wakaba-iter
 */

$.on(
	['192.168.137.54', '2-ch.ru', 'iichan.ru', 'wakachan.org'],
	function (data) {
		$.to('wakaba')
		return data
	})

$.on(
	'2-ch.ru',
	function (data) {
		$.on('css', function (css) {return css+'div.adminbar{text-align:left}'})
		return data
	})
