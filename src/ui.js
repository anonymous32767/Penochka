/**
 * @module ui
 * @title Пользовательский интерфейс
 * @descr Генерация элементов пользовательского интерфейса. Расстановка
 * наиболее общих из них.
 * @depends jquery kernel
 */

/* TODO: Parametrize me */

$.ui = {}

$.extend($.ui, {
   notify: function (text, id, highlight, cancel) {
		var cancelBtn = ''/* cancel ? ' [' + $.ui.msg('x', 'cancel', id) + ']' : ''; */
      return '<div class="' + $.iom.css.notify + (highlight ? $.iom.css.highlight : '') + '" nid="'+id+'">' + text + cancelBtn + '</div>'
   },
   msg: function (title, m, param) {
      return '<a href="javascript://" ' +
         (param ? 'param="'+param+'"' : '')
         + ' msg="'+m+'">'+title+'</a>'
   },
   ref: function (num) {
      return '<a href="#'+num+'">' + $.iom.ref + num + '</a>'
   },
   footer: function () {
      var statsStr =  $.i18n.stats.
         replace('%ds%', $.timer.cache).
         replace('%ts%', $.timer.total + $.i18n.ms)
      return '<a href="' + $.i18n.aboutURL + '"' +
         ' title="' + statsStr + '">' +
         $.i18n.scriptName + '</a>'
   },
   window: function (title, content, menu, hasSearch) {
      return '<div><span class="penMenu">' + menu + '</span>' +
         '<span class="penSearch">' +
         (hasSearch ? '<input size="35" keymsg="googol"></span>':'') +
         '</span>' +
         '<h1>' + title + '</h1>' +
         content
      '</div>'
   }
})



$.on('loaded', function () {
   $('.footer a:first').before($.ui.footer()+ ' + ')
})

/* Build thread and main menus */
var threadMenu = ''
var threadMenu2 = ''
var mainMenu = ''

$.on('ready',
     function (data) {
        threadMenu = $.to('/r/ thread menu', []).sort().join(' / ')
        threadMenu2 = $.to('/r/ thread menu 2', []).sort().join(' / ')
        mainMenu = $.to('/r/ main menu', []).sort().join(' / ')
        return data
     })

/* Notifications */
$.on(
   'domready',
   function (data) {
      /* Notifications container */
      $(data.e.body).prepend('<div id="notifications" style="position:fixed;max-width:400px;">')
      /* Main menu */
      $($.iom.mainmenu).after(mainMenu)
      return data
   }, true)

$.on(
   'pending',
   function (data) {
      $('#notifications').append($.ui.notify(data.wtf, data.nid, false, true))
   })

$.on(
   'fail',
   function (data) {
      $('#notifications').append($.ui.notify(data.wtf, data.nid, false))
      setTimeout(function () {
         $.to('pending ok', {nid:data.nid})
      }, 3000)
   })

$.on(
   'pending ok',
   function (data) {
      $('#notifications div[nid="'+data.nid+'"]').remove()
   })

/* Thread menus */
var opFlag = true
var endOfThread = null

$.on(
   'post',
   function (data) {
      var subj = $(data.e)
      if (opFlag) {
         endOfThread = subj.pst()
         opFlag = false
      }
      if (data.op) {
         opFlag = true
         var om = $.aToOmitted(data.e)
         if (om)
            var info = om.innerText = om.innerText.replace(/\..*$/,'.')
			try {
         $($.aToThreadMenu(data.e)).before(threadMenu)
         if (endOfThread) {
            endOfThread.
               after(
                  '<span class="omittedposts">' +
                     (info ? info : '') +
                     ' ['+ threadMenu2 +']</span>')
            endOfThread = null
         }
			} catch (e) {}
      }
      return data
   })


/* Подстройка меню */
$.on(
   'wakaba',
   function (data) {
      $.on(
         '/r/ main menu',
         function (data) {
            return data.concat('<!--0-->')
         })

      $.on(
         '/r/ thread menu',
         function (data) {
            return data.concat('<!--z-->')
         })
      return data
   })