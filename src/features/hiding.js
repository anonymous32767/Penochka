/**
 * @module hiding
 * @title Скрытие
 * @descr Скрытие сообщений и потоков
 * @depends jquery kernel ui evproxy
 */

$.on(
	'post',
	function (data) {
		$($.aToPostMenu(data.e)).append(' '+$.ui.msg('×', 'toggle post'))
		return data
	})

$.on(
	'toggle post',
	function (data) {
		$(data.e).pst().toggle()
	})

$.on(
	['/r/ thread menu', '/r/ thread menu 2'],
	function (data) {
		return data.concat('<!--1-->'+$.ui.msg($.i18n.hide, 'toggle thread'))
	})

$.on(
	'toggle thread',
	function (data) {
		$(data.e).thrd().toggle()
	})