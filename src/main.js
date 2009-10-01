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
function showReplyForm(id, citeid) {
   if(!id)
      return
   var subj = $(iom.postform+id)
   if(subj.attr('id')) {
      subj.show()
      if (typeof citeid != undefined) {
         var msg = subj.find(iom.form.message)
         msg.val(msg.val() + '>>' + citeid.replace('p',''))
         msg[0].focus()
      }
      return
   } else {
      var subj = $(iom.postform).clone(true).tuneForThread(id);
      subj.attr('id', 'postform' + id);
      subj.prepend(
         $('<div style="float:right">').
            append(
               $.ui.multiLink([
                  ['Скрыть',
                   function() { $(iom.postform + id).hide() }]
               ])))
      $('#'+ id + ' ' + iom.thread.eot).after(subj)
      showReplyForm(id, citeid)
   }
}

/* */
function cacheThread(idurl, cb) {
   if (idurl.search(/\//) == -1) {
      var o = $('#'+idurl)
      var moar = o.find(iom.thread.moar)
      var moarBkp = moar.clone(true)
      moar.text('Загрузка треда...')
      var url = o.find(iom.post.reflink).attr('href').split('#')[0]
   } else {
      var url = idurl
   }
   $.fn.ajaxThread(
      url,
      function(e) {
         apply_me(e, true)
         var ue = e.find(iom.tid)
         var id = ue.attr('id')
         ue.appendTo('#cache')
         ue.attr('id', 'fold'+id)
         if (moarBkp)
            moar.replaceWith(moarBkp)
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
      var pstr = env.find(iom.form.poster)
      pstr.val(pstr.val() == 'sage' ? '' : 'sage')
      var ttl = env.find(iom.form.title)
      ttl.val(ttl.val() == 'sage' ? '' : 'sage')
      var msg = env.find(iom.form.message)
      db.config.sage.capsBold[0] &&
         ttl.val(ttl.val() == '**SAGE**' ? '' : '**SAGE**')
   }
}

function chktizer(obj, id, tp) {
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
         ' скрыт. ['
   } else {
      tizText = 'Пост ' + id.replace('p','№') + ' ' +
         ' скрыт. ['
   }
   obj.before($.ui.tizer(
      id,
      $.ui.multiLink([
         ['Показать',
          function () { toggleVisible(id) }]
      ], tizText)
      , tp))
}

function apply_refs(a, body) {
   if(!$('#tizRefs'+pid).attr('id')) {
      var tiz = $.ui.tizer('Refs'+pid, refs(), false)
      apply_isense(tiz.find('a'))
      tiz.css('display', 'block')
      tiz.append('#cache')
   }
}

function addBokmark(id) {
   // todo
}

function withSelection(subj, f){
   if (document.selection){
      var str = document.selection.createRange().text;
      var sel = document.selection.createRange();
      sel.text=f(str);
   } else if (typeof subj.selectionStart != 'undefined') {
      var before, after, selection;
      before= subj.value.substring(0, subj.selectionStart)
      selection = subj.value.substring(subj.selectionStart, subj.selectionEnd)
      after = subj.value.substring(subj.selectionEnd, subj.value.length)
      subj.value= String.concat(before, f(selection), after)
   }
}

function setupEnv (db, env) {
   var bmenu = [['Настройки',
            function () { settingsShow() }]]
   if (1) 
      bmenu.push(['Закладки',
            function () {  }])
   
   $(iom.menu).append(
         $.ui.multiLink(bmenu, '- [')
      )
   
   if($(iom.form.parent).length > 0) {
      $('title').append(
         ' &#8212; ' +
            $.ui.threadCite(env.find(iom.tid).attr('id'), db.config.hiding.citeLength[0] - 1))
   }

   if (db.config.sage.button[0]) {
      env.find(iom.form.email).after(
         $.ui.multiLink([
            ['Сажа',
             function () { sage() }]
         ], ' <b>[', ']</b>')
      )}

   db.config.sage.button[0] &&
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

   db.config.sage.button[0] &&
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
                  function (s) { return '**'+s+'**' }) }],
            ['<u>П</u>', function () {
               withSelection(
                  env.find(iom.form.message),
                  function (s) { return '__'+s+'__' }) }],
         ],' <b>[',']</b>'))

   db.config.sage.sageMan[0] &&
      sage(env)

   /* Const password */
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
            var str = turingTest.val()
            turingTest.val(str.substring(0,caret) + recoded + str.substring(caret))
            key.target.selectionStart = caret+1
            key.target.selectionEnd = caret+1
            return false
         }
      }
   )
}

apply_me = function (messages, isSecondary) {
   messages.find(iom.pid).each(
      function () {
         var subj = $(this)
         var pid = subj.attr('id')
         if(db.config.hiding.posts[0]) {
            subj.find(iom.post.ref).after($.ui.multiLink([
               ['X',
                function () { chktizer(subj, pid, false); toggleVisible(pid) }]
            ]))
         }
         /* Censore */
         if(db.config.censore.v[0]) {
            var censf = true;
            if(censf) {
               db.hidden[pid]=1
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
      }
   )

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
                  function () { chktizer(subj, tid, true); toggleVisible(tid) }])
            if (db.config.unfoldThreads[0] && (subj.find(iom.thread.moar).length | isSecondary))
               tmenu.push([
                  isSecondary ? 'Свернуть' : 'Развернуть',
                  function () { toggleThread(tid, !isSecondary) }])
            if (1)
               tmenu.push([
                  'В закладки',
                  function () {  }])
	    if ($(iom.form.parent).length == 0)
               tmenu.push([
		  'Ответ',
		  function () { window.location.href = turl }])

            trm.replaceWith($.ui.multiLink(tmenu, '', ''))
            if (db.config.replyForm[0]) {
               subj.find(iom.post.reflink).each(
                  function () {
                     var subj = $(this)
                     var pid = subj.findc(iom.pid).attr('id')
                     subj.click(
                        function () { showReplyForm(tid, pid); return false; }
                     )}
               )}
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
      subj.css('display','none')
      chktizer(subj, objId, objId.search(/t/) == -1 ? false : true)
      messages.find('#tiz'+objId).css('display','block')
   }

   /* Bookmarks */
   //$('body').append('<div style="position:fixed; right:0%; top:10%; width: 3%; height: 6%" class="reply">')
}

/* */
db.loadCfg(defaults)

$(document).ok(db, setupEnv, apply_me)