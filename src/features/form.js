/**
 * @module form
 * @title Операции с формами
 * @descr Настройка формы ответа и удаления треда.
 * @depends header jquery ui css
 */

var cfg = {hideIndex:true, moveThread:true, fastReply: true}

$.on(
	'ready',
	function (data) {
		cfg = $.to('/r/ cfg', cfg)
		return data
	})

$.on(
	'/r/ settings',
	function (settings) {
		return settings.concat([
			{idx: 'postform', name: 'Форма ответа'},
			{idx: 'hideIndex', name: 'Скрывать на главной', 
			 group: 'postform', valobj: cfg},
			{idx: 'moveThread', name: 'Переносить вниз в треде', 
			 group: 'postform', valobj: cfg}
		])
	})

$.on(
	'/r/ main menu',
	function (data) {
		return (!$.isThread && cfg.hideIndex) ? data.concat(
			'<!--3-->' + 
				$.ui.msg($.i18n.createThread, 'toggle form')) : data
	})

$.on(
	'toggle form',
	function (data) {
		$($.iom.postform).toggle()
		data.e.innerText = data.e.innerText == $.i18n.createThread ? $.i18n.hideForm : $.i18n.createThread
		return data
	})

$.on(
	'domready',
	function (data) {
		if ($.isThread && cfg.moveThread) {
			$($.iom.eot).before($($.iom.postform))
		}
		if (!$.isThread && cfg.hideIndex) {
			$($.iom.postform).toggle()
		}
		return data
	}, true)

$.on(
	'/r/ thread menu 2',
	function (data) {
		return cfg.fastReply ? data.concat('<!--4-->'+$.ui.msg('Ответить', 'reply form')) : data
	})