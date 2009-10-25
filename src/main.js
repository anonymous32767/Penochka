/*
 * vim: ts=3 sts=3 cindent expandtab
 *
 * penochka - Various extensions for imageboards,
 *            which powered by jquery.
 *
 * Copyright (c) 2009, anonymous
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the anonymous nor the names of its contributors
 *       may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY anonymous ''AS IS'' AND ANY  EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL anonymous BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

jQuery.fn.swap = function(b){
   b = jQuery(b)[0];
   var a = this[0];
   var t = a.parentNode.insertBefore(document.createTextNode(''), a);
   b.parentNode.insertBefore(a, b);
   t.parentNode.insertBefore(b, t);
   t.parentNode.removeChild(t);
   return this;
};

/* Penochka application function variable */
var apply_me = {}

/* */
function showReplyForm(id, cite, parent, hideHide, needHr) {
   if(!id)
      return
   var subj = $(iom.postform+id)
   if(subj.attr('id')) {
      subj.show()
      if (cite) {
         var msg = subj.find(iom.form.message)
         msg.val(msg.val() + cite)
         msg[0].focus()
      }
      return
   } else {
      var subj = $(iom.postform).clone(true).tuneForThread(id);
      subj.attr('id', 'postform' + id);
      if (!hideHide)
         subj.prepend(
            $('<div style="float:right">').
               append(
                  $.ui.multiLink([
                     ['Скрыть',
                      function() { $(iom.postform + id).hide() }]
                  ])))
      if (needHr)
	 subj.prepend('<hr />')
      if (!parent)
         parent = $('#'+ id + ' ' + iom.thread.eot)
      parent.after(subj)
      showReplyForm(id, cite)
   }
}

/* */
function cacheThread(idurl, cb) {
   if (idurl.search(/\//) == -1) {
      var o = $('#'+idurl)
      var moar = o.find(iom.thread.moar)
      var load = $('<span class="penLoadMoar">Загрузка треда...</span>')
      moar.hide().after(load)
      var url = o.find(iom.post.reflink).attr('href').split('#')[0]
   } else {
      var url = idurl
   }
   $.fn.ajaxThread(
      url,
      function(e) {
         e.find(iom.thread.reflink).attr('href', url)
         apply_me(e, true)
         var ue = e.find(iom.tid)
         var id = ue.attr('id')
         ue.appendTo('#cache')
         ue.attr('id', 'fold'+id)
         if (moar) {
            moar.show()
            o.find('span.penLoadMoar').remove()
         }
         if (cb)
            cb()
      })
}

function toggleThread(id, useAjax) {
   var swapid =
      function (o1, o2) {
         var t = o1.attr('id')
         o1.attr('id', o2.attr('id'))
         o2.attr('id', t)
      }
   if(($('#fold'+id).length == 0)) {
      if (useAjax)
         cacheThread(id, function () { toggleThread(id, false) })
   } else {
      $('#'+id).swap('#fold'+id)
      swapid($('#'+id), $('#fold'+id))
   }
}

/* */
function toggleVisible(id) {
   $('#'+id).toggle()
   $('#tiz'+id).toggle()
   if (db.hidden[id]) {
      delete db.hidden[id]
   } else {
      db.hidden[id] = 1;
   }
   db.saveHidden()
}

/* */
function swapAttr(obj, a1, a2) {
   var t = obj.attr(a1)
   obj.attr(a1, obj.attr(a2))
   obj.attr(a2, t)
}

function refold(id) {
   var subj = $('#' + id + ' ' + iom.post.image)
   var ofs = subj.offset();
   if(!$("#itiz"+id).attr('id')) {
      subj.one(
         "load",
         function () {
            $('#itiz'+id).hide()
         })
      subj.a().before(
         $.ui.loadTizer(ofs.left, ofs.top, id)
      )
   }
   swapAttr(subj, 'style', 'altstyle')
   swapAttr(subj, 'src', 'altsrc')
   if (db.cfg.fitImgs) {
      subj.css('max-width', $(window).width() - 64 + 'px')
   }
   return false;
}

/* */
function apply_isense(a) {
   if(!db.cfg.iSense) {
      return
   }
   a.hover(
      function(evt) { // over
         intelli(
            evt.pageX+10,
            evt.pageY+10,
            a.attr('refid'),
            a.attr('refurl')
         )
      },
      function(evt) { // out
         outelli(a.attr('refid'))
      }
   )
}

var z = 0;
var ist = {};

function intelli(x, y, id, url) {
   clearTimeout(ist[id])
   ist[id] = setTimeout(
      function () {
         $('#is'+id).remove()
         var obj = {}
         if(($('#'+id).length == 0) && url) {
            cacheThread(url, function () { intelli(x, y, id) })
            obj = $.ui.preview(
               $('<div></div>').text('Загрузка...').attr('id', 'is' + id),
               x, y)
         } else {
            obj = $.ui.preview(id, x, y)
         }
         obj.attr('id','is'+id);
         obj.hover(
            function(evt) {
               clearTimeout(ist[id])
            },
            function(evt) {
               outelli(id)
            })
         obj.css('z-index', z++);
         $('body').prepend(obj);
      },
      db.cfg.iSenseUp)
}

function outelli(id) {
   clearTimeout(ist[id])
   ist[id] = setTimeout(
      function () {
         $('#is'+id).remove()
      },
      db.cfg.iSenseDn)
}

function sage(env) {
   if(!env) {
      env = $('body')
   }
   var email = env.find(iom.form.email)
   email.val(email.val() == 'sage' ? '' : 'sage')
   if (db.cfg.sageInAllFields) {
      var pstr = env.find(iom.form.user)
      pstr.val(pstr.val() == 'sage' ? '' : 'sage')
      var ttl = env.find(iom.form.title)
      ttl.val(ttl.val() == 'sage' ? '' : 'sage')
   }
}

function chktizer(obj, id, tp, sage, filtered) {
   var tizText = "";
   if ($('#tiz' + id).attr('id') || db.cfg.hidePure)
      return
   if (tp) { /* tp - thread/post. true - thread */
      if(db.cfg.hideCiteLen) {
         var cite = '(' +
            obj.find(iom.thread.message).text().slice(0, db.cfg.hideCiteLen - 1) +
            '...)'
      } else { var cite = '' }
      tizText = 'Тред ' + id.replace('t','№') + ' ' + cite +
         (filtered ? ' отфильтрован' : ' скрыт') + '. ['
   } else {
      tizText = 'Пост ' + id.replace('p','№') + ' ' +
         (filtered ? ' отфильтрован' : ' скрыт') + '. ['
   }
   var tmenu = [['Показать',
                 function () { toggleVisible(id) }]]
   if (sage) {
      tmenu.push(['Сажа',
                  function () {
                     showReplyForm(id, tizText + 'Показать / Сажа]', tizer);
                     sage($(iom.postform+id)) }])
   }
   var tizer = $.ui.tizer(
      id,
      $.ui.multiLink(tmenu, tizText)
      , tp)
   obj.before(tizer)
}

function apply_refs(a, body) {
   if(!$('#tizRefs'+pid).attr('id')) {
      var tiz = $.ui.tizer('Refs'+pid, refs(), false)
      apply_isense(tiz.find('a'))
      tiz.css('display', 'block')
      tiz.append('#cache')
   }
}

function toggleBookmarks() {
   var genBookmarks = function () {
      var div = $('<span id="penBmsIn">')
      for (i in db.bookmarks) {
         div.append($.ui.bookmark(i, db.bookmarks[i].cite,  db.bookmarks[i].timestamp))
      }
      return div
   }
   if ($('#penBms').length == 0) {
      $.ui.window(
         'penBms',
         iom.strings.bookmarks,
         $.ui.multiLink([
            ['Закрыть',
             function () { toggleBookmarks () }]
         ])).
         append(genBookmarks()).
         append('<br /><br clear="both"/>')
   } else {
      $('#penBmsIn').replaceWith(genBookmarks())
   }
   $('#penBms').toggle()
}

function toggleBookmark(tid) {
   var subj = $('#'+tid)
   var url = $.turl(tid)
   if (db.bookmarks[url]) {
      delete db.bookmarks[url]
   } else {
      var tcite =  $.ui.threadCite(tid, db.cfg.bmCiteLen - 1)
      db.bookmarks[url]= { timestamp : new Date().getTime(), cite : tcite }
   }
   db.saveBookmarks()
   return db.bookmarks[url]
}

function toggleSettings () {
   var genVal = function (id, val) {
      var selected = null
      if(db.combos[id]) {
	 selected = val
	 val = db.combos[id]
      }
      switch (typeof val) {
      case 'object':
	 var retstr = '<select>'
	 
	 for (var k in val) {
	    retstr += '<option '+(k == selected ? 'selected="selected"':'')+' name="' + k + '">' + val[k] + '</option>'
	 }
	 return retstr + '</select>'
	 break
      case 'boolean':
	 return '<input type="checkbox" ' + (val ? 'checked="checked"' : '') + '/>'
	 break
      case 'string':
	 return '<input size="45" value="' + val + '" />'
	 break
      case 'number':
	 return '<input size="8" value="' + val + '" />'
	 break
      default:
	 return ''
      }
   }
   var genDef = function (level) {
      return level > 1 ? '<button>По умолчанию</button>' : ''
   }
   var defaultSetting = function (subj) {
      var id = subj.attr('id').replace(/^pen/, '')
      var inp = subj.find('input, select')
      db.cfg[id] = db.dflt[id]
      if(db.combos[id]) {
	 for(var def in db.combos[id]) {
	    inp.find('option:selected').removeAttr('selected')
	    inp.find('option[name='+def+']').attr('selected', 'selected')
	    break
	 }
      } else {
	 switch (typeof db.cfg[id]) {
	 case 'boolean':
	    if (db.cfg[id]) {
	       inp.attr('checked', 'checked')
	    } else {
	       inp.removeAttr('checked')
	    }
	    break
	 case 'number':
	 case 'string':
	    inp.attr('value', db.cfg[id])
	    break
	 }	 
      }
   }
   var genSettings = function () {
      var slist = function (items, level) {
         var setStr = '';
	 var o = 0
         for (var id in items) {
            setStr += '<span id="pen' + items[id] + '" class="penSetting penLevel' + level + '">' +
               db.name[items[id]] + ( level < 3 ? '<span class="right">' + genVal(items[id], db.cfg[items[id]]) + genDef(level) + '</span>' : genVal(items[id], db.cfg[items[id]])) + '</span>'
            if (db.children[items[id]]) {
               setStr += slist(db.children[items[id]], level + 1)
            }
	    o++
         }
         return setStr
      }
      var generated = $(slist(db.roots, 1))
      generated.find('button').click(
	 function () {
	    var childrenEnded = false
	    var e = $(this).closest('span.penSetting')
	    defaultSetting(e)
	    e.nextAll('span.penSetting').each(
	       function () {
		  if (!$(this).hasClass('penLevel3')) {
		     childrenEnded = true
		  }
		  if (!childrenEnded) 
		     defaultSetting($(this))
	       }
	    )
	 })

      var genControls = $('<span><br /><button>Восстановить умолчания</button> <input id="penSettingsSearch" size="33" style="float:right"><br /></span>')
      genControls.find('button').click(
	 function () {
	    generated.find('button').click()
	 }
      )
      genControls.find('input').keypress(
	 function () {
	    generated.find('.penSetting:contains("' + $(this).val() + '")').hide()
	 }
      )
      genControls.append(generated)
      return genControls
   }
   var saveSettings = function () {
      $('#penSettings').find('input, option:selected').each(
	 function () {
	    var e = $(this)
	    if (e.is('#penSettingsSearch'))
	       return
	    var id = e.closest('span.penSetting').attr('id').replace(/^pen/, '')
	    if (e.attr('type') == 'checkbox') {
	       db.cfg[id] = e.attr('checked')
	    } else if (e.is('option')) {
	       db.cfg[id] = e.attr('name')
	    } else { 
	       db.cfg[id] = e.val()
	    }
	 })
   }

   if ($('#penSettings').length == 0) {
      $.ui.window(
         'penSettings',
         iom.strings.settings,
         $.ui.multiLink([
            ['Применить',
             function () { 
		saveSettings()
		db.saveCfg()
		location.reload(true) }],
	    ['Закрыть',
	     function () { $('#penSettings').hide() }]
         ])).
         append(genSettings())
   }
   $('#penSettings').toggle()
}

function withSelection (subj, f) {
   var before, after, selection;
   subj.each(
      function () {
         if (this.value != '') {
            before = this.value.substring(0, this.selectionStart)
            selection = this.value.substring(this.selectionStart, this.selectionEnd)
            after = this.value.substring(this.selectionEnd, this.value.length)
            this.value = before.concat(f(selection), after)
         }
      })
}

function setupEnv (db, env) {
   var isNight = true
   var thm = db.cfg.nightTime.match(/(\d+)\D+(\d+)\D+(\d+)\D+(\d+)/)
   if(((thm[3] < db.global.time.getHours()) && (thm[1] > db.global.time.getHours())) || 
      ((thm[3] == db.global.time.getHours()) && (thm[4] < db.global.time.getMinutes())) ||
      ((thm[1] == db.global.time.getHours()) && (thm[2] > db.global.time.getMinutes()))) {
      isNight = false
   }
   addStyle(css[isNight ? db.cfg.ntheme : db.cfg.theme])
   db.loadBookmarks()

   var bmenu = [['Настройки',
                 function () { toggleSettings() }]]
   if (db.cfg.bmarks)
      bmenu.push(['Закладки',
                  function () { toggleBookmarks() }])

   env.find(iom.menu).after(
      $.ui.multiLink(bmenu, ' / ', '')
   )

   env.find(iom.postform).submit(function () {
      if (db.cfg.bmAutoAdd) {
         var subj = $(this)
         var t = $(this).parents(iom.tid)
         var tid = t.attr('id')
         if (!toggleBookmark(tid)) {
            toggleBookmark(tid)
         }
      }
      if (db.cfg.useAJAX) {
         subj.find(iom.form.status).text('Отправка...')
         subj.ajaxSubmit({
            timeout: 0,
            success:
            function(responseText, statusText) {
               if (responseText.search(/delform/) == -1) {
                  var errResult = responseText.match(/<h1.*?>(.*?)<br/)[1]
                  subj.find(iom.form.status).text(errResult)
               } else {
                  subj.find(iom.form.status).text('Ok. Обновляем страницу...')
                  window.location.reload(true)
               }
            }})
         return false
      }
   })

   if (db.cfg.tripleTt) {
      var img = env.find(iom.form.turimage)
      img.css('padding-right', '3px').
         after(img.clone(true)).click().
         after(img.clone(true)).click()
   }


   if($(iom.form.parent).length > 0) {
      if (db.cfg.citeInTitle) {
         $('title').append(
            ' &#8212; ' +
               $.ui.threadCite('delform', db.cfg.ttlCiteLen - 1))
      }
      if (db.cfg.thrdMenu) {
         env.find('hr:first').next('a:first').after (
            $.ui.multiLink([
               ['Развернуть изображения',
                function (e) {
		   $(iom.post.image).parent().click() 
		}],
               ['Переключить сообщения без картинок',
                function () { $(iom.pid).each(
                   function () {
                      if ($(this).find(iom.post.image).length == 0)
                         $(this).toggle()
                   }) }],
	       ['Переключить сообщения без ответов на них',
                function () { $(iom.pid).each(
                   function () {
                      if ($(this).find(iom.post.backrefs).length == 0)
                         $(this).toggle()
                   }) }]
            ], ' / ', '').css('left', '0')
         )
      }
      if (db.cfg.thrdMove) {
         env.find(iom.thread.header+','+iom.postform).hide()
      }
   }
   if (db.cfg.idxHide) {
      env.find(iom.postform).hide()
      env.find('hr').slice(0,1).hide()
   }

   if (db.cfg.sageBtn) {
      env.find(iom.form.email).after(
         $.ui.multiLink([
            ['Сажа',
             function () { sage() }]
         ], ' <b>[', ']</b>')
      )}

   if (db.cfg.fmtBtns) {
      env.find(iom.postform + ' ' + iom.form.submit).after(
         $.ui.multiLink([
            ['КБ', function () {
               withSelection(
                  env.find(iom.form.message),
                  function (s) { return '**'+s.toUpperCase()+'**' }) }],
            ['<span class="spoiler">SP</span>', function () {
               withSelection(
                  env.find(iom.form.message),
                  function (s) { return '%%'+s+'%%' }) }]
         ],' <b>[',']</b>'))

      env.find(iom.postform + ' ' + iom.form.submit).after(
         $.ui.multiLink([
            ['Ж', function () {
               withSelection(
                  env.find(iom.form.message),
                  function (s) { return '**'+s+'**' }) }],
            ['<i>К</i>', function () {
               withSelection(
                  env.find(iom.form.message),
                  function (s) { return '*'+s+'*' }) }],
            ['<s>З</s>', function () {
               withSelection(
                  env.find(iom.form.message),
                  function (s) {
                     var l = s.length
                     for (var i = 0; i < l; i++) {
                        s += '^H'
                     }
                     return s }) }],
            ['<u>П</u>', function () {
               withSelection(
                  env.find(iom.form.message),
                  function (s) { return '__'+s+'__' }) }],
            ['<tt>Код</tt>', function () {
               withSelection(
                  env.find(iom.form.message),
                  function (s) {
                     if (s.search(/\n/) != -1) {
                        return '    '+s.replace(/\n/g, '\n    ')
                     } else {
                        return '`'+s+'`' }
                  }) }]
         ],' <b>[',']</b>'))
   }

   /* id надо менять только после манипуляций с формой, потому что иначе
      перестает работать селектор. TODO сделать это и ненужным */


   db.cfg.sageMan &&
      sage(env)

   db.cfg.constPwd &&
      env.find(iom.form.password).val(db.cfg.constPwd)

   var turingTest = env.find(iom.form.turtest)
   turingTest.keypress(
      function (key) {
         var recoded = $.xlatb[String.fromCharCode(key.which).toLowerCase()]
         if (recoded) {
            /* Not a perfect piece of code, but
                  i'm thank you eurekafag (: */
            var caret = key.target.selectionStart
            var str = key.target.value
            key.target.value = str.substring(0,caret) + recoded + str.substring(caret)
            key.target.selectionStart = caret+1
            key.target.selectionEnd = caret+1
            return false
         }
      }
   )
}

apply_me = function (messages, isSecondary) {
   messages.find(iom.tid).each(
      function () {
         var subj = $(this)
         var tid = subj.attr('id')
         var turl = subj.find(iom.thread.reflink).attr('href').split('#')[0]
         var tmenu = []
         var trm = subj.find(iom.thread.ref).next('a')
         if (trm.length == 0) {
            subj.find(iom.thread.ref).after('&nbsp; [<a/>]')
            trm = subj.find(iom.thread.ref).next('a')
         }
         if (db.cfg.thrdHide)
            tmenu.push([
               'Скрыть',
               function () { chktizer(subj, tid, true, true); toggleVisible(tid) }])
         if (db.cfg.thrdUnfold && (subj.find(iom.thread.moar).length | isSecondary))
            tmenu.push([
               isSecondary ? 'Свернуть' : 'Развернуть',
               function () { toggleThread(tid, !isSecondary) }])
         if (db.cfg.bmarks)
            tmenu.push([
               db.bookmarks[turl] ? 'Из закладок' : 'В закладки',
               function (e) { $(e.target).text(toggleBookmark(tid) ? 'Из закладок' : 'В закладки') }])
         if ($(iom.form.parent).length == 0)
            tmenu.push([
               'Ответ', turl])
         trm.replaceWith($.ui.multiLink(tmenu, '', ''))
         if($(iom.form.parent).length == 0) {
            var moar = subj.find(iom.thread.moar).clone()
            if (moar.length == 0) {
               moar = $('<span class="omittedposts"></span>')
            }
            tmenu[tmenu.length-1] = [
               'Ответить',
               function () { showReplyForm(tid) }]
            moar.append($.ui.multiLink(tmenu))
            subj.find(iom.thread.eot).after(moar)
         }
         /** Posts **/
         subj.find(iom.pid).each(
            function () {
               var subj = $(this)
               var pid = subj.attr('id')
               if (db.cfg.pstsHide) {
                  subj.find(iom.post.ref).append($.ui.multiLink([
                     ['&#215;',
                      function () { chktizer(subj, pid, false); toggleVisible(pid); return false; }]
                  ], ' ', ''))
               }
               /* Censore */
               if(db.cfg.censTitle != '' || db.cfg.censUser != '' || db.cfg.censMail != '' || db.cfg.censMsg != '' || db.cfg.censTotal != '') {
                  var censf = false;
                  if (db.cfg.censTitle &&
                      subj.find(iom.post.title).text().search(db.cfg.censTitle) != -1) {
                     censf = true
                  }
                  if (db.cfg.censUser &&
                      subj.find(iom.post.poster).text().search(db.cfg.censTitle) != -1) {
                     censf = true
                  }
                  if (db.cfg.censMail &&
                      subj.find(iom.post.email).text().search(db.cfg.censMail) != -1) {
                     censf = true
                  }
                  if (db.cfg.censMsg &&
                      subj.find(iom.post.message).text().search(db.cfg.censMsg) != -1) {
                     censf = true
                  }
                  if (db.cfg.censTotal &&
                      subj.text().search(db.cfg.censTotal) != -1) {
                     censf = true
                  }
                  if(censf) {
                     db.filtered[pid]=1
                  }
               }
               if (db.cfg.fwdRefs && $.references[pid]) {
                  var refs =
                     function () {
                        var r = [];
                        for (j in $.references[pid]) {
                           r.push($.ui.anchor($.references[pid][j]))
                        }
                        return $.ui.refs(r.join(', '))
                     }
                  subj.find(iom.post.message).before(refs())
               }
               if (db.cfg.fastReply) {
                  subj.find(iom.post.reflink).click(
                     function () {
                        showReplyForm(tid, '>>'+pid.replace('p',''));
                        return false; }
                  )}
            })

      }
   )

   db.cfg.imgsUnfold &&
      messages.find(iom.post.image).each(
         function () {
            var subj = $(this)
            subj.a().click(
               function () {
                  return refold(subj.findc(iom.pid).attr('id'))
               }
            ).removeAttr('target')
         }
      )


   db.cfg.iSense &&
      messages.find(iom.anchors).each(
         function () { apply_isense($(this)) }
      )


   for(var objId in db.hidden) {
      /* It's an low level alternative of toggle method
          * TODO Rewrite toggle for suitable usage in this
          * place (may be impossible). */
      if (objId) {
         var subj = messages.find('#'+objId)
         subj.css('display', 'none')
         chktizer(subj, objId, objId.search(/t/) == -1 ? false : true)
         messages.find('#tiz'+objId).css('display','block')
      }
   }
   for (var objId in db.filtered) {
      /* It's an low level alternative of toggle method
          * TODO Rewrite toggle for suitable usage in this
          * place (may be impossible). */
      var subj = messages.find('#'+objId)
      subj.css('display', 'none')
      chktizer(subj, objId, false, false, true)
      messages.find('#tiz'+objId).css('display','block')
   }
}

function postSetup () {
   if (db.cfg.thrdMove && $(iom.form.parent).length > 0) {
      showReplyForm($(iom.tid).attr('id'), null, null, true, true)
   }
   scope.timer.diff('penochka sync');
   scope.timer.init();
   setTimeout(function() {
      scope.timer.diff('async queue');
      $('p.footer a:last').
         after(' + <a href="http://github.com/anonymous32767/Penochka/" title="' + scope.timer.cache + ' total: ' + scope.timer.total + 'ms">penochka UnStAbLe</a>')
   },0);
}

db.loadCfg()
db.loadHidden()

$(document).ok(db, setupEnv, apply_me, postSetup)


