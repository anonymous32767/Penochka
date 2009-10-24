/*
 * vim: ts=3 sts=3 cindent expandtab
 * jquery.imgboard - jquery extensions for imageboards.
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

/* */
/*@ http://www.mail-archive.com/jquery-en@googlegroups.com/msg16487.html */
function addStyle( css ) {
   var style = document.createElement( 'style' );
   style.type = 'text/css';
   var head = document.getElementsByTagName('head')[0];
   head.appendChild( style );
   if( style.styleSheet )  // IE
      style.styleSheet.cssText = css;
   else  // other browsers
      style.appendChild( document.createTextNode(css) );
   return style;
}

/* Some useful stuff */
jQuery.fn.extend({
   /* Finds element parent which has class passed in argument. */
   findc:
   function(cls) {
      return $(this).is(cls) ? $(this) : $(this).parents(cls)
   }
})

/* */
/*
  For localization to your language simply replace this table.
 */
var xlatb =
   {й: 'q', ц: 'w', у: 'e', к: 'r', е: 't', н: 'y', г: 'u',
    ш: 'i', щ: 'o', з: 'p', ф: 'a', ы: 's', в: 'd', а: 'f',
    п: 'g', р: 'h', о: 'j', л: 'k', д: 'l', я: 'z', ч: 'x',
    с: 'c', м: 'v', и: 'b', т: 'n', ь: 'm'
   }

var blatx =
   {q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г',
    i: 'ш', o: 'щ', p: 'з', '[': 'х', ']': 'ъ', a: 'ф',
    s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л',
    l: 'д', ';': 'ж', '\'': 'э', z: 'я', x: 'ч', c: 'с',
    v: 'м', b: 'и', n: 'т', m: 'ь', ',': 'б', '.': 'ю'}

/* State machine here - walks through siblings and add it to
   specific IOM element.

   All posts on 2-ch except of oppost fold into <td> tag. So
   it isn't need to fold it into anything. Simply find this
   <td> and apply our id.

   Now function destructive - it's overrides native id's of
   elements.
*/

iom = {
   tid: '.penThread',
   pid: '.penPost',
   post: {
      anchor: 'a[name]',
      image: 'a img',
      imageinfo: 'span.filesize',
      abbr: 'div.abbrev',
      abbrlink: 'div.abbrev a',
      wholemessage: 'blockquote',
      message: 'blockquote:not(.penRefs):first',
      ref: 'span.reflink',
      reflink: 'span.reflink a:first',
      title: 'span.replytitle, span.filetitle',
      poster: 'span.commentpostername, span.postername',
      email: 'span.commentpostername a, span.postername a'
   },
   thread: {
      header: 'div.theader',
      ref: 'span.reflink:first',
      reflink: 'span.reflink:first a',
      message: 'blockquote:not(.penRefs):first',
      moar: 'span.omittedposts',
      title: 'span.filetitle',
      eot: '.penPost:last'
   },
   form: {
      user: 'input[name=akane]',
      email: 'input[name=nabiki]',
      title: 'input[name=kasumi]',
      message: 'textarea[name=shampoo]',
      file: 'input[name=file]',
      turtest: 'input[name=captcha]',
      turimage: '#imgcaptcha',
      password: 'input[name=password]',
      parent: 'input[name=parent]',
      submit: 'input[type=submit]',
      status: 'i:first'
   },
   anchors: 'blockquote a[onclick]',
   menu: 'div.adminbar:first a:last',
   options: '#penOptions',
   postform: '#postform',
   strings: {
      bookmarks: 'Два.ч &#8212; Закладки',
      settings: 'Два.ч &#8212; Настройки',
   }
}

function dvach (onload) {
   function parse (cloned) {
      var opPost = $('<span></span>');
      var currThread = $('<span></span>');
      cloned.contents().each(
         function () {
            var subj = $(this)
            if (subj.is('table')) {
               if (opPost) {
                  currThread.append(opPost);
                  opPost = false;
               }
               subj.attr('id', 'p' + subj.find('a[name]').attr('name'));
               subj.addClass('penPost');
            }
            if(opPost) {
               opPost.append(subj);
               if(subj.is('a') && subj.attr('name')) {
                  currThread.attr('id', 't'+subj.attr('name'));
                  currThread.addClass('penThread');
                  opPost.attr('id', 'p'+subj.attr('name'));
                  opPost.addClass('penPost');
               }
            } else if (currThread) {
               currThread.append(this);
            }
            if ($(this).is('hr')) {
               if (opPost) {
                  currThread.append(opPost);
               }
               cloned.append(currThread);
               opPost = $('<span/>');
               currThread = $('<span/>');
            }
         }
      );
      cloned.append(currThread);
   }

   function process(cloned) {
      cloned.find(iom.anchors).each(
         function () {
            var subj = $(this)
            var a = subj.attr('href').split('#')
            var refurl = a[0]
            var refid = a[1]
            if (!refid) {
               // Op post workaround
               refid = subj.attr('href').split('.')[0].split('/').reverse()[0]
            }
            var pid = 'p' + refid
            var spid = subj.findc(iom.pid).attr('id')
            subj.attr('refid', pid)
            subj.attr('refurl', refurl)
            if(!$.references[pid]) {
               $.references[pid] = []
            }
            $.references[pid][spid]=spid
         })
      cloned.find(iom.thread.moar).each(
         function () {
            $(this).html($(this).text().split('.')[0]+'. ')
         })
      cloned.find(iom.post.image).each(
         function () {
            var subj = $(this)
            var altsrc = subj.a().attr('href')
            var w = subj.attr('width')
            var h = subj.attr('height')
            subj.attr('altsrc',altsrc)
            subj.attr('style','height: '+h+'px; width:'+w+'px;')
            subj.attr('altstyle','clear: both;min-height: '+h+'px; min-width: '+w+'px;')
            subj.removeAttr('height')
            subj.removeAttr('width')
         }
      )
   }

   jQuery.fn.extend({
      tuneForm:
      function () {
         $(this).find('div.rules').remove()
         return $(this)
      },
      tuneForThread:
      function (tid) {
         var tnum = tid.replace('t','')
         var form = $(this)
         var lnum = $('#' + tid + ' ' + iom.thread.eot).findc(iom.pid).attr('id').replace('p','')
         /* Reserved: manually switch to thread gb2

         form.find('input[name=gb2][value=board]').removeAttr('checked')
         form.find('input[name=gb2][value=thread]').attr('checked','checked') */
         form.tuneForm()
         form.prepend('<input type="hidden" name="parent" value="' + tnum + '" />')
         var turingTest = form.find(iom.form.turimage)
         
	 if (turingTest.length == 0) {
	    turingTest = $('<img alt="обновить" src="/' + db.global.board + '/captcha.pl?key=mainpage&amp;dummy=" onclick="update_captcha(this)" id="imgcaptcha" />')
	    turingTest.focus(function () { return false; })
            form.find(iom.form.turtest).
               after(turingTest)
         }

         turingTest.attr(
            'src',
            turingTest.attr('src').
               replace(/key=\S*&/, "key=res" + tnum + "&").
               replace(/dummy=\S*/, "dummy=" + lnum)
         )
         turingTest.click()
         return form
      },
      ajaxThread:
      function (url, f) {
         var e = $('<span/>')
         e.load(
            'http://'+location.host + url + ' #delform',
            {},
            function (a,b,c) {
               if (b != 'success') {
                  return
               }
               var cloned = $(e).find('#delform')
               parse(cloned)
               process(cloned)
               f(cloned)
            })
      }
   });

   jQuery.extend({
      turl: function (tid) {
         return '/' + db.global.board + '/res/'+tid.replace(/\D/g, '')+'.html'
      }
   });

   jQuery.xlatb = xlatb;
   jQuery.references = [];
   jQuery.bookmarks = [];

   jQuery.ui = {
      anchor :
      function(pid) {
         var pnum = pid.replace('p','')
         return '<a href="#'+pnum+'" refid="'+pid+'" onclick="highlight('+pnum+')">&gt;&gt;'+pnum+'</a>'
      },
      refs :
      function (content) {
         return '<blockquote class="penRefs"><small>Ссылки '+content+'.</small></blockquote>'
      },
      preview :
      function (idobj, x, y) {
         if (typeof idobj == 'string') {
            var obj = $('#'+idobj).clone(true)
         } else {
            var obj = idobj
         }
	 obj.find('a[name]').removeAttr('name')
         obj.addClass(db.cfg.hlPrevs ? 'highlight' : 'reply')
         obj.attr('style','position:absolute; top:' + y +
                  'px; left:' + x + 'px;display:block;')
         return obj
      },
      threadCite:
      function (id, len) {
         var subj = $('#' + id)
         var topic = subj.find(iom.thread.title).text()
         return ((topic ? topic + '//' : '') +
                 subj.find(iom.thread.message).text()).
            slice(0, len)
      },
      loadTizer: function (x, y, id) {
         return $('<div style="position:absolute;top:' + y +
                  'px;left:' + x + 'px;z-index:99;background-color:maroon;color:white;padding:2px;font-weight:bold;" id="itiz' + id + '">Загрузка...</div>')
      },
      multiLink :
      function(handlers, begin, end, sep, cssClass) {
         begin = begin != null ? begin : '['
         end =  end != null ? end : ']'
         sep =  sep != null ? sep : ' / '
         var ancs = []
         for(var i = 0; i < handlers.length; i++)
            if (typeof handlers[i][1] == 'string') {
               ancs.push('<a href="' + handlers[i][1] + '">'+handlers[i][0]+'</a>')
            } else {
               ancs.push('<a href="javascript:">'+handlers[i][0]+'</a>')
            }
         var j = 0
         var res = $('<span class="' + (cssClass ? cssClass : 'penMl') + '">'
                     + begin + ancs.join(sep) + end + '</span>')
         var lastA = false
         res.find('a').each(
            function () {
               var subj = $(this)
               if (subj.attr('href') == 'javascript:') {
                  subj.click(handlers[j][1])
               }
               if(!lastA)
                  subj.addClass('first')
               lastA = subj
               j++
            })
         lastA.addClass('last')
         return res
      },
      tizer :
      function (id, body, hasHr) {
         return $("<div id=\'tiz" + id + "\' style='display:none;' />").
            append(body).
            append(hasHr ? "<br clear='both' /><hr />" : "")
      },
      window:
      function (id, title, menu) {
         var div = $('<div id="' + id + '" style="display:none"></div>').
            append($('<h1 style="float:left;margin:0;padding:0;" class="logo">' + title + '</h1>')).
            append(menu.css('float', 'right')).
            append('<br clear="borh" /><br />')
         $('body').prepend(div)
         return div
      },
      bookmark:
      function (url, cite, date) {
         return $('<div class="penDesc"> /' + url.replace(/.*?(\w+).*/, '$1') +
                  '/ <a class="penBmLink" href="' + url + '">' +
                  url.replace(/.*?(\d+).*/, '$1') + '</a> ' + cite + '</div>').
            prepend(
               $.ui.multiLink([
                  ['x',
                   function (evt) {
                      var subj = $(evt.target).parents('div:first')
                      delete db.bookmarks[subj.find('a.penBmLink').attr('href')]
                      db.saveBookmarks ()
                      subj.remove()
                   }]
               ])
            )
      }
   }

   return function (obj, f, aft) {
      var css = '#penSetttings {padding: 8px} #penSettings .right {float: right} #penSettings span {height: 32px} #penSettings input, #penSettings select {margin-left: 8px; margin-right: 8px} .penLevel1, .penLevel2 {display: block} .penSetting {height: 24px;} .penLevel1 {font-size: 16pt; font-weight: bold;} .penLevel2 {padding-left: 2em;}  .penLevel3 {padding-left: 4em;}'
      /* if (obj.find('#captchadiv').length > 0) {
         obj.find(iom.form.turtest).
            after('<img alt="обновить" src="/b/captcha.pl?key=mainpage&amp;dummy=" onclick="update_captcha(this)" id="imgcaptcha" />').focus(function () { return false; })
      } */

      onload()

      var threadsRaw = obj.find('#delform');
      var cloned = threadsRaw.clone()

      parse(cloned);
      process(cloned);
      $('body').append('<div id="cache" style="display:none" />')
      addStyle(css)
      f(cloned)
      threadsRaw.replaceWith(cloned);
      aft()
   };
}/* end of 2ch */

jQuery.fn.extend({
   a: function () {
      return $(this).parents('a:first');
   },
   ok: function(db, env, msg, aft) {
      if (typeof GM_setValue != "undefined") {
         /* we are under firefox's greasemonkey */
         document = unsafeWindow.document
         var converge = dvach(function() { env(db, $(unsafeWindow.document)) })
         converge($(unsafeWindow.document), msg, aft)
      } else {
         this.ready(
            function () {
               var subj = $(this)
               var converge = dvach(function() { env(db, subj) })
               converge(subj, msg, aft)
            }
         )
      }
   }
})