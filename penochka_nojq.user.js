﻿// ==UserScript==
// @name	Penochka experimental
// @include	*2-ch.ru*
// @include	*oper.ru*
// @include	*1chan.ru*
// @include	*iichan.ru*
// @include	*02ch.su*
// @require	http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// ==/UserScript==

/*
 * vim: ts=3 sts=3 cindent expandtab
 *
 * penochka - various extensions from imageboards.
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

/* Extending jQuery with some staff. */
;(function () {
   /** Timer object. It's lacks precision a bit due to jQuery library loading */
   jQuery.timer = {
      time : 0,
      total : 0,
      init : function() {
         this.time = (new Date()).getTime();
      }, check : function(str) {
         var d = new Date();
         d = (new Date()).getTime() - this.time;
         this.total += d;
         this.cache += str + ': ' + d + 'мсек; ';
			this.time = (new Date()).getTime()
      },
      cache : ''
   }

   jQuery.timer.init()

   var events = {}

   jQuery.on = function(evname, fun, issys, iscap) {
      if (issys != null) {
         var dispatcher = this[0] || document
         dispatcher.addEventListener(evname, fun, iscap)
      } else {
			evname = $.makeArray(evname)
         for (var i = 0; i < evname.length; i++) {
				try {
               events[evname[i]].push(fun)
				} catch (err) {
					events[evname[i]] = [fun]
				}
			}
      }
   }

   jQuery.to = function (evname, cookie) {
      try {
         for(var i = 0; cookie && i < events[evname].length; i++)
            cookie = events[evname][i](cookie)
         return cookie
      } catch (err) { return null }
   }

   /*@ http://www.mail-archive.com/jquery-en@googlegroups.com/msg16487.html */
   jQuery.css = function  ( css ) {
      var style = document.createElement( 'style' );
      style.type = 'text/css';
      var head = document.getElementsByTagName('head')[0];
      head.appendChild( style );
      if( style.styleSheet )  /* IE */
         style.styleSheet.cssText = css;
      else  /* other browsers */
         style.appendChild( document.createTextNode(css) );
      return style;
   }

   jQuery.fn.reverse = [].reverse

   jQuery.fn.sort = [].sort

   jQuery.extend({
      swap:function(b){
         b = $(b)[0]
         var a = this[0];
         var t = a.parentNode.insertBefore(document.createTextNode(''), a);
         b.parentNode.insertBefore(a, b);
         t.parentNode.insertBefore(b, t);
         t.parentNode.removeChild(t);
         return this;
      }
   })

   jQuery.ss = {}

})();

/** Cache */
(function () {

   var cache = {};
   var bad = {};

   $.on('/r/ cache', function (data) {
      var part = $('<span/>')
      var url = data.href.split('#')[0]
      if (cache[url]) {
         data.data = cache[url]
         return $.to('cache ok', data)
      }
      if (bad[url]) {
         data.wtf = 'Cache error'
         return $.to('fail', data)
      }
      $.to('pending', data)
      part.load(
         url + ' ' + $.ss.cache,
         function (responseText, textStatus, XMLHttpRequest) {
            if (textStatus == 'timeout') {
               data.wtf = textStatus
               return $.to('cache fail', data)
            }
            if (({success:1,notmodified:1})[textStatus]) {
               cache[url] = part
            } else {
               bad[url] = true
            }
            return $.to('/r/ cache', data)
         })
   })
})();

/** wakaba support */
(function () {
   $.on(
      ['iichan.ru', '2-ch.ru', '02ch.su'],
      function () {
			$.on('ready',function () { 
				$.css('.penPreview {border: 2px dashed #EE6600;}')
				return true
			})

         jQuery.extend({
            extractPost: function(id, doc) {
               var anchor = $('a[name="'+id+'"]:first', doc)
               if (!anchor.length)
                  return false
               var ret = anchor.closest('table')
               if (!ret.length)
                  return $('<div class="reply">ОП-пост</div>')
               else
                  return ret
            },
            makeBox: function (text) {
               return $('<div class="reply">' + text + '</div>')
            },
				insertInFooter: function (a) {
					$('p.footer a:last').after(' + ' + a)
				}})

         jQuery.extend(jQuery.ss, {
            refsep: '>>',
            cache: '#delform'
         })

      })
})();

/* 02ch.su support 
(function () {
   $.on('02ch.su', function () { $.to('wakaba',1)})
})();

 2-ch.ru support 
(function () {
   $.on('2-ch.ru', function () { $.to('wakaba',1)})
})(); */


/** 1chan support */
(function () {
   $.on(
      '1chan.ru',
      function () {
			$.on('ready', function () { 
				$.css('.penPreview {border: 1px dashed #666;}')
				return true
			})

         jQuery.extend({
            extractPost: function(id, doc) {
               var anchor = $('a[name="'+id+'"]:first', doc)
               if (!anchor.length)
                  return false
               var ret = anchor.closest('div.b-comment')
               if (!ret.length)
                  return $.makeBox('ОП-пост')
               else
                  return ret
            },
            makeBox: function (text) {
               return $('<div class="b-comment">' + text + '</div>')
            },
				insertInFooter: function (a) {
					$('div.b-footer-copyrights').append('<p>' + a + '</p>')
				}})

         jQuery.extend(jQuery.ss, {
            refsep: '>>',
            cache: 'div.l-content-wrap'
         })
      })
})();

/** old.1chan support */
(function () {
   $.on(
      'old.1chan.ru',
      function () {
			$.on('ready', function () { 
				$.css('.penPreview {border: 1px dashed #666;}')
				return true
			})

         jQuery.extend({
            extractPost: function(id, doc) {
               var anchor = $('a[name="'+id+'"]:first', doc)
               if (!anchor.length)
                  return false
               var ret = anchor.closest('div.comm')
               if (!ret.length)
                  return $.makeBox('Странная ссылка')
               else
                  return ret
            },
            makeBox: function (text) {
               return $('<div class="comm">' + text + '</div>')
            },
				insertInFooter: function (a) {
					$('body').append('<span>' + a + '</span>')
				}})

         jQuery.extend(jQuery.ss, {
            refsep: '>>',
            cache: 'table'
         })
      })
})();

(function () {
   $.on(
      ['oper.ru','games.oper.ru'],
      function () {
         $.on('ready', function () {  
				$.css('.penPreview {border: 1px dashed grey;} ' + 
						'td[width="120"], td[width="240"], #topbanner,' + 
						' #headermenuu {display: none !important}')
				return true
			})

         jQuery.extend({
            extractPost: function(id, doc) {
               var anchor = $('a[name="'+id+'"]:first', doc)
               if (!anchor.length)
                  return false
               var ret = anchor.next()
               if (!ret.length)
                  return $.makeBox('ОП-пост')
               else
                  return ret
            },
            makeBox: function (text) {
               return $('<div class="b-comment">' + text + '</div>')
            },
				insertInFooter: function (a) {
					$('p.bottomh a:last').after(' | ' + a )
				}})

         jQuery.extend(jQuery.ss, {
            refsep: '#',
            cache: '#container'
         })
      })
})();

/* Images unfolding */
;(function () {
   function preparePreview (subj) {
      return '<img src="' + subj.parent().attr('href') + '" ' +
         'style="min-width:' + subj.attr('width') + 'px;' +
         'min-height:' + subj.attr('height') + 'px;">'
   }

   function togglePreview (subj) {
      if (!subj.attr('altimg'))
         var t = preparePreview(subj)
      else
         var t = subj.attr('altimg')

      subj.removeAttr('altimg')
      var alt = $(t).attr('altimg', subj.parent().html())
      subj.replaceWith(alt)
   }

   function testThumb (subj) {
      return subj.is('a[href] img')
         && ({jpeg:1,jpg:1,png:1,gif:1,tiff:1,bmp:1})
      [subj.parent().attr('href').
       replace(/^.*\.(\w+)$/,'$1').toLowerCase()]
   }

   $.on(
      'click',
      function (e) {
         var subj = $(e.target)
         if (e.which == 1 && testThumb(subj)) {
            togglePreview(subj)
            return false
         } else {
            return e
         }
      })

})();

;(function () {

   var raiseDelay = 100;
   var fallDelay = 100;

   $.on('/r/ post', function(data) {
      var addr = data.href.split('#')
      var extracted = $.extractPost(addr[1], data.ctx)
      if (extracted) {
         if (extracted.length) {
            data.data = extracted
            $.to('post ok', data)
         } else {
            data.wtf = 'Anchor found but post not extracted.'
            $.to('fail', data)
         }
      } else {
         return $.to('/r/ cache', data)
      }
   })

   $.on(
      'post ok',
      function (data) {
         if (data.preview) {
				$('.penPreviewTmp').remove()
				var cloned = data.data.clone()
				cloned.addClass('penPreview')
            showPreview(
               cloned,
               data.preview.x,
               data.preview.y)
         }
      })

   $.on(
      'cache ok',
      function (data) {
         if (data.preview) {
            data.ctx = data.data
            $.to('/r/ post', data)
         }
      })

   $.on(
      'fail',
      function (data) {
         if (data.preview) {
            showPreview(
               $.makeBox('Ошибка: ' + data.wtf).
						addClass('penPreviewTmp'),
               data.preview.x,
               data.preview.y)
            delete hrefxy[data.href]
         }
      })

   $.on(
      'pending',
      function (data) {
         if (data.preview) {
            showPreview(
               $.makeBox('Загрузка...').
						addClass('penPreviewTmp'),
               data.preview.x,
               data.preview.y)
         }
      })

   function showPreview(what, x, y) {
		if (document.body.clientWidth - x < 420) {
			x = document.body.clientWidth - 500
		}
      what.attr(
         'style',
         'position:absolute; top:' + y + 
				'px; left:' + x + 
				'px; max-width: ' + (document.body.clientWidth - x - 10) + 'px').
         appendTo('body')
   }
	
	var t = null

   $.on(
      'mouseover',
      function (e) {
         var subj = $(e.target)
         if (subj.is('a:contains("' + $.ss.refsep + '")')) {
				clearTimeout(t)
            t = setTimeout(
               function () {
                  $.to('/r/ post', {href: subj.attr('href'), ctx: document,
                                    preview: {x: e.pageX, y: e.pageY}})
               }, raiseDelay)
            return false
         } if (subj.closest('.penPreview').length) {
				clearTimeout(t)
			} else {
            return e
         }
      })

   $.on(
      'mouseout',
      function (e) {
         var subj = $(e.target)
         if (subj.is('a:contains("' + $.ss.refsep + '")') 
				 || subj.closest('.penPreview')) {
				clearTimeout(t)
            t = setTimeout(
               function () {
                  $('.penPreview, .penPreviewTmp').remove()
               }, fallDelay)
            return false
         } else {
            return e
         }
      })
})();


/* The dispatcher */
;(function () {

   try { document = unsafeWindow.document } catch (err) {}

   /* Sending event 'domain name'. E.g. for www.2-ch.ru $.to('2-ch.ru')
      will be sent */
   $.to(location.host, 1)
	$.timer.check('Загрузка скрипта')

   /* DOM Startup */
   $.on('ready', function () {
		$.timer.init()

      $(document).click(
         function (e) {
            return $.to('click', e)
         })
      document.addEventListener(
         'mouseover', function (e) {
            return $.to('mouseover', e)
         }, true)
      document.addEventListener(
         'mouseout', function (e) {
            return $.to('mouseout', e)
         }, true)
      $(document).submit(
         function (e) {
            return $.to('submit', e)
         })

		$.timer.check('Установка событий')

		$.insertInFooter('<a href="" title="' + 
							  $.timer.cache + ' Итого: ' + 
							  $.timer.total + 'мсек">пеночка</a>')
   })

	try { 
		var dummy = unsafeWindow
		$.to('ready',1)
	} catch (e) { 
		$(function () {
			if (!$.timer)
				$.noConflict(true)
			$.to('ready',1)}) } 
})();