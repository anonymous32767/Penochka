/**
 * @module funlib
 * @title Библиотека трассировки на основе функциональных примитивов
 * @descr Небольшая библиотека для трассировки ДОМа
 * @depends kernel
 */

$.extend({
	foldUntil: function (iter, mfun, cookie) {
		while (cookie && !mfun(cookie)) {
			cookie = iter(cookie)
		}
		return cookie
	},
	nextUntil: function (mfun, items) {
		return this.foldUntil(
			function (a) { return a.nextSibling },
			mfun, items)
	}
})