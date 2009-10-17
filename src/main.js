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
function showReplyForm(id, cite, parent, hideHide) {
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
   db.saveState()
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
   if (db.config.fitImages[0]) {
      subj.css('max-width', $(window).width() - 64 + 'px')
   }
   return false;
}

/* */
function apply_isense(a) {
   if(!db.config.intelliSense.v[0]) {
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
      db.config.intelliSense.raiseup[0])
}

function outelli(id) {
   clearTimeout(ist[id])
   ist[id] = setTimeout(
      function () {
         $('#is'+id).remove()
      },
      db.config.intelliSense.fallback[0])
}

function sage(env) {
   if(!env) {
      env = $('body')
   }
   var email = env.find(iom.form.email)
   email.val(email.val() == 'sage' ? '' : 'sage')
   if (db.config.sage.inAllFields[0]) {
      var pstr = env.find(iom.form.user)
      pstr.val(pstr.val() == 'sage' ? '' : 'sage')
      var ttl = env.find(iom.form.title)
      ttl.val(ttl.val() == 'sage' ? '' : 'sage')
      var msg = env.find(iom.form.message)
      db.config.sage.capsBold[0] &&
         ttl.val(ttl.val() == '**SAGE**' ? '' : '**SAGE**')
   }
}

function chktizer(obj, id, tp, sage, filtered) {
   var tizText = "";
   if ($('#tiz' + id).attr('id') || db.config.hiding.goodStealth[0])
      return
   if (tp) { /* tp - thread/post. true - thread */
      if(db.config.hiding.citeLength[0]) {
         var cite = '(' +
            obj.find(iom.thread.message).text().slice(0, db.config.hiding.citeLength[0] - 1) +
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

function toggleBookmark(tid) {
   var subj = $('#'+tid)
   var url = $.turl(tid)
   if ($.bookmarks[url]) {
      $.bookmarks[url] = null
   } else {
      var tcite =  $.ui.threadCite(tid, db.config.bookmarks.citeLength[0] - 1)
      $.bookmarks[url]=tcite
   }
   storeBookmarks()
   return $.bookmarks[url]
}

function withSelection(subj, f){
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
   loadBookmarks()

   var bmenu = [['Настройки',
                 function () { settingsShow() }]]
   if (db.config.bookmarks.v[0])
      bmenu.push(['Закладки',
                  function () { toggleBookmarks() }])

   env.find(iom.menu).append(
      $.ui.multiLink(bmenu, '- [')
   )

   if (db.config.bookmarks.autoAdd[0]) { // !!!
      env.find(iom.postform).submit(function () {
         var subj = $(this)
         var t = $(this).parents(iom.tid)
         var tid = t.attr('id')
         if (!toggleBookmark(tid)) {
            toggleBookmark(tid)
         }
         if (db.config.form.useAJAX[0]) {
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
   }

   if (db.config.form.tripleCaptcha[0]) {
      var img = env.find(iom.form.turimage)
      img.css('padding-right', '3px').
         after(img.clone(true)).click().
         after(img.clone(true)).click()
   }


   if($(iom.form.parent).length > 0) {
      if (db.config.citeInTitle[0]) {
         $('title').append(
            ' &#8212; ' +
               $.ui.threadCite('delform', db.config.hiding.citeLength[0] - 1))
      }
      if (db.config.threadMenu[0]) {
         env.find('hr:first').next('a:first').after (
            $.ui.multiLink([
               ['Переключить картинки',
                function () { $(iom.post.image).parent().click() }],
               ['Переключить сообщения без картинок',
                function () { $(iom.pid).each(
                   function () {
                      if ($(this).find(iom.post.image).length == 0)
                         $(this).toggle()
                   }) }],
            ], ' / ', '').css('left', '0')
         )
      }
      if (db.config.form.moveAtEnd[0]) {
         env.find(iom.thread.header+','+iom.postform).hide()
      }
   }
   if (db.config.form.hideInIndex[0]) {
      env.find(iom.postform).hide()
      env.find('hr').slice(0,1).hide()
   }

   if (db.config.form.sageButton[0]) {
      env.find(iom.form.email).after(
         $.ui.multiLink([
            ['Сажа',
             function () { sage() }]
         ], ' <b>[', ']</b>')
      )}

   if (db.config.form.formatButtons[0]) {
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


   db.config.sage.sageMan[0] &&
      sage(env)

   db.config.state.constPasswd[0] &&
      env.find(iom.form.password).val(db.config.state.constPasswd[0])

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
   db.config.hiding.threads[0] &&
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
            if (db.config.hiding.threads[0])
               tmenu.push([
                  'Скрыть',
                  function () { chktizer(subj, tid, true, true); toggleVisible(tid) }])
            if (db.config.unfoldThreads[0] && (subj.find(iom.thread.moar).length | isSecondary))
               tmenu.push([
                  isSecondary ? 'Свернуть' : 'Развернуть',
                  function () { toggleThread(tid, !isSecondary) }])
            if (db.config.bookmarks.v[0])
               tmenu.push([
                  $.bookmarks[turl] ? 'Из закладок' : 'В закладки',
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
                  if(db.config.hiding.posts[0]) {
                     subj.find(iom.post.ref).append($.ui.multiLink([
                        ['&#215;',
                         function () { chktizer(subj, pid, false); toggleVisible(pid); return false; }]
                     ], ' ', ''))
                  }
                  /* Censore */
                  if(db.config.censore.v[0]) {
                     var censf = false;
                     if (db.config.censore.title[0] &&
                         subj.find(iom.post.title).text().search(db.config.censore.title[0]) != -1) {
                        censf = true
                     }
                     if (db.config.censore.username[0] &&
                         subj.find(iom.post.poster).text().search(db.config.censore.username[0]) != -1) {
                        censf = true
                     }
                     if (db.config.censore.email[0] &&
                         subj.find(iom.post.email).text().search(db.config.censore.email[0]) != -1) {
                        censf = true
                     }
                     if (db.config.censore.msg[0] &&
                         subj.find(iom.post.message).text().search(db.config.censore.msg[0]) != -1) {
                        censf = true
                     }
                     if (db.config.censore.total[0] &&
                         subj.text().search(db.config.censore.total[0]) != -1) {
                        censf = true
                     }
                     if(censf) {
                        db.filtered[pid]=1
                     }
                  }
                  if (db.config.forwardReferences.v[0] && $.references[pid]) {
                     var refs =
                        function () {
                           var r = [];
                           for (j in $.references[pid]) {
                              r.push($.ui.anchor($.references[pid][j]))
                           }
                           return $.ui.refs(r.join(', '))
                        }
                     if(db.config.forwardReferences.asDog[0]) {
                        subj.find(iom.post.ref).after(
                           $.ui.multiLink([
                              ['ц', function () {}]
                           ]))
                     } else {
                        subj.find(iom.post.message).before(refs())
                     }
                  }
                  if (db.config.form.showInThread[0]) {
                     subj.find(iom.post.reflink).click(
                        function () {
                           showReplyForm(tid, '>>'+pid.replace('p',''));
                           return false; }
                     )}
               }
            )

         }
      )

   db.config.unfoldImages[0] &&
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

   db.config.intelliSense.v[0] &&
      messages.find(iom.anchors).each(
         function () { apply_isense($(this)) }
      )


   for(var objId in db.hidden) {
      /* It's an low level alternative of toggle method
          * TODO Rewrite toggle for suitable usage in this
          * place (may be impossible). */
      var subj = messages.find('#'+objId)
      subj.css('display', 'none')
      chktizer(subj, objId, objId.search(/t/) == -1 ? false : true)
      messages.find('#tiz'+objId).css('display','block')
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
   if (db.config.form.moveAtEnd[0] && $(iom.form.parent).length > 0) {
      showReplyForm($(iom.tid).attr('id'), null, null, true)
   }
   scope.timer.diff('penochka sync');
   scope.timer.init();
   setTimeout(function() {
      scope.timer.diff('async queue');
      $('p.footer a:last').
         after(' + <a href="http://github.com/anonymous32767/Penochka/" title="' + scope.timer.cache + ' total: ' + scope.timer.total + 'ms">penochka UnStAbLe</a>')
   },0);
}

db.loadCfg(defaults)

$(document).ok(db, setupEnv, apply_me, postSetup)