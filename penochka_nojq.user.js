// ==UserScript==
// @name	Penochka experimental
// @include	*2-ch.ru*
// @include	*oper.ru*
// @include	*1chan.ru*
// @include	*iichan.ru*
// @include	*02ch.su*
// @include	*dobrochan.ru*
// @include	*0chan.ru*
// @include	*boards.4chan.org*
// @include	*olanet.ru*
// @require	http://ajax.googleapis.com/ajax/libs/jquery/1.3/jquery.min.js
// ==/UserScript==
		

/*
 * vim: ts=3 sts=3 cindent expandtab
 *
 * penochka - Various extensions for imageboards powered by jQuery.
 *
 * Copyright (c) 2009, anonymous, released under terms of BSD license.
 *
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
 *
 * Greetz: anonymous, bhc, dvanon, eurekafag, userscripts.org staff, zoi.
 * 
 */


var __startup = (new Date()).getTime()
 

/** kernel - Ядерные функции

    Наиболее общеупотребительные функции пеночки */
;(function ($) {
	$.timer = {
		time : __startup,
      total : 0,
      init : function() {
         this.time = (new Date()).getTime();
      }, check : function(str) {
         var delta = (new Date()).getTime() - this.time
         this.total += delta;
         this.cache += str + ': ' + delta + 'мсек; ';
         this.time = (new Date()).getTime()
      },
      cache : ''
   }
      
	var events = {}
	$.on = function(evname, fun) {
      evname = $.makeArray(evname)
      for (var i = 0; i < evname.length; i++) {
         try {
            events[evname[i]].push(fun)
         } catch (err) {
            events[evname[i]] = [fun]
         }
      }
   }
	$.to = function (evname, cookie) {
      try {
         for(var i = 0; cookie != null && i < events[evname].length; i++)
            cookie = events[evname][i](cookie)
         return cookie
      } catch (err) { return null }
   }
	$.css = function  ( css ) {
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
	$.extend({
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
	$.ss = {}
})(jQuery);

/** wakaba - Вакаба

    Поддержка имиджбордов на базе этого движка */
;(function ($) {
	$.on(
      ['iichan.ru', '2-ch.ru', '02ch.su', '2ch.olanet.ru'],
      function () {
			$.on('ready',function () { 
				$.css('.penPreview {border: 2px dashed #EE6600;}')
				return true
			})

			function extractOppost (anchor) {
				return $.makeBox('Оп-пост')
			}

         $.extend({
            extractPost: function(id, doc) {
               var anchor = $('a[name="'+id+'"]:first', doc)
               if (!anchor.length)
                  return false
               var ret = anchor.closest('td')
               if (!ret.length)
                  return extractOppost()
               else
                  return ret
            },
            makeBox: function (text) {
               return $('<div class="reply">' + text + '</div>')
            },
				insertInFooter: function (a) {
					$('p.footer a:last').after(' + ' + a)
				}})

         $.extend(jQuery.ss, {
            refsep: '>>',
            cache: '#delform'
         })

			return true
      })
})(jQuery);

/** onechan - 1chan.ru

    Поддержка одночана */
;(function ($) {
	   $.on(
      '1chan.ru',
      function () {
			$.on('ready', function () { 
				$.css('.penPreview {border: 1px dashed #666;}')
				return true
			})

         $.extend({
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

         $.extend(jQuery.ss, {
            refsep: '>>',
            cache: 'div.l-content-wrap'
         })
      })
	$.on(
      'old.1chan.ru',
      function () {
			$.on('ready', function () { 
				$.css('.penPreview {border: 1px dashed #666;}')
				return true
			})

         $.extend({
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

         $.extend(jQuery.ss, {
            refsep: '>>',
            cache: 'table'
         })
      })
})(jQuery);

/** goblach - Сайт называется Гоблач

    Поддержка сайта oper.ru */
;(function ($) {
	$.on(
      ['oper.ru','games.oper.ru','kino.oper.ru','travel.oper.ru','english.oper.ru','photo.oper.ru'],
      function () {
         $.on('ready', function () {  
				$.css('.penPreview {border: 1px dashed grey;} ' + 
						'td[width="120"], td[width="240"], #topbanner,' + 
						' #headermenuu {display: none !important}')
				return true
			})

         $.extend({
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
})(jQuery);

/** zerochan - Нульчан

    Поддержка нульчана */
;(function ($) {
	$.on(
      ['www.0chan.ru','0chan.ru'],
      function () {
         $.on('ready', function () {  
				$.css('.penPreview {border: 2px dashed #EE6600;} div.penPreview {background: #eee;}')
				return true
			})

         $.extend({
            extractPost: function(id, doc) {
               var anchor = $('a[name="'+id+'"]:first', doc)
               if (!anchor.length)
                  return false
               var ret = anchor.closest('td.reply, div.postnode')
               if (!ret.length)
                  return $.makeBox('Непонятно')
               else
                  return ret
            },
            makeBox: function (text) {
               return $('<td class="reply">' + text + '</div>')
            },
				insertInFooter: function (a) {
					$('#boardlist_footer a:last').after('] [' + a )
				}})

         $.extend(jQuery.ss, {
            refsep: '>>',
            cache: 'table:first'
         })
      })
})(jQuery);

/** dobrochan - Доброчан

    Поддержка доброчана */
;(function ($) {
	$.on(
      ['www.dobrochan.ru','dobrochan.ru'],
      function () {
		
         $.on('ready', function () {  
				$.css('.penPreview {}')
				
				/* К сожалению я пока не могу найти способ отменять стандартный
            обработчик onclick() кроме как выдирать его с корнем. */
				$('img.thumb').removeAttr('onclick')
				
				return true
			})

         $.extend({
            extractPost: function(id, doc) {
               var anchor = $('a[name="'+id+'"]:first', doc)
               if (!anchor.length)
                  return false
               var ret = anchor.closest('.reply, .post')
               if (!ret.length)
                  return $.makeBox('Непонятно')
               else
                  return ret
            },
            makeBox: function (text) {
               return $('<div class="reply">' + text + '</div>')
            },
				insertInFooter: function (a) {
					$('p.footer a:last').after(' + ' + a )
				}})

         $.extend(jQuery.ss, {
            refsep: '>>',
            cache: 'form[action$=delete]'
         })
      })
})(jQuery);

/** yotsuba - 4chan

    Поддержка форчана */
;(function ($) {
	$.on(
      ['boards.4chan.org'],
      function () {
			$.on('ready',function () { 
				$.css('.penPreview {border: 1px dashed #EE6600;}')
				return true
			})

         $.extend({
            extractPost: function(id, doc) {
               var anchor = $('input[name="'+id+'"]:first', doc)
               if (!anchor.length)
                  return false
               var ret = anchor.closest('td')
               if (!ret.length)
                  return $.makeBox('ОП-пост')
               else
                  return ret
            },
            makeBox: function (text) {
               return $('<td class="reply">' + text + '</td>')
            },
				insertInFooter: function (a) {
					$('#footer a:last').after(' + ' + a)
				}})

         jQuery.extend(jQuery.ss, {
            refsep: '>>',
            cache: 'form[name="delform"]'
         })
			
			var prevURL = null

			$.on('post ok',
			function (data) { 
				prevURL = data.href.split('#')[0]
				return data 
			})

			$.on('fail',
				function (data) {
					if (data.preview && !data.fixed) {
						var addr = data.href.split('#')
						if (addr[0] == '' && prevURL) {
							addr[0] = prevURL
							$.to('/r/ post', 
										  {href:addr[0] + '#' + addr[1],
								         preview: data.preview, 
											ctx: document, fixed: true})
							return null
						}
					}
					return data
				})

			return true

      })
})(jQuery);

/** olanet - Оланет

    Поддержка оланета */
;(function ($) {
	$.on(
      ['olanet.ru'],
      function () {
			$.on('ready',function () { 
				$.css('.penPreview {border: 1px dashed grey; background: white}')
				return true
			})

			function extractOppost (anchor) {
				return $.makeBox('Оп-пост')
			}

         $.extend({
            extractPost: function(id, doc) {
               var anchor = $('a[name="'+id+'"]:first', doc)
               if (!anchor.length)
                  return false
               var ret = anchor.next()
               if (!ret.length)
                  return extractOppost()
               else
                  return ret
            },
            makeBox: function (text) {
               return $('<div class="c">' + text + '</div>')
            },
				insertInFooter: function (a) {
					$('a[name="bottom"]').after(' ' + a)
				}})

         $.extend(jQuery.ss, {
            refsep: '>>',
            cache: 'div.application_content'
         })

      })
	var prevURL = null

			$.on(
			'2ch.olanet.ru', 
			function () {
				$.on('fail',
					function (data) {
						if (data.preview && !data.fixed) {
							var addr = data.href.split('#')
							if (addr[0] == '') { /* Проверка на то, что это
                     наш случай --- отсуствует урл */
								var href = $('a[href="'+data.href+'"]').
									closest('blockquote').
									prevAll('span.reflink').
									find('a').attr('href')
								if (href) {
									var newaddr = href.split('#')
									/* Если пришла какая-либо поебня вместо 
                              ссылки заменим ее предыдущим урлом */
									if(!newaddr[1]) {
										if(prevURL)
											newaddr[0] = prevURL
										else
											return data 
									}
									prevURL = newaddr[0]
									$.to('/r/ post', 
										  {href:newaddr[0] + '#' + addr[1], 											preview: data.preview, 
											ctx: document, fixed: true})
									return null
								}
							}
						}
						return data
					})
			})
			 
			$.extend(jQuery.ss, {
            cache: 'div.application_content'
         })
})(jQuery);

/** dispatcher - Диспетчеризация пеночки

    Запуск скрипта. Мост между браузерной системой событий и внутренними событиями пеночки */
;(function ($) {
	   try { document = unsafeWindow.document } catch (err) {}

   /* Sending event 'domain name'. E.g. for www.2-ch.ru $.to('2-ch.ru')
      will be sent */
   $.to(location.host, 1)

	/* GUI messages */
   $.on(
	   'click',
		function (e) {
			var subj = $(e.target)
			if (subj.attr('penmsg')) {
				$.to(subj.attr('penmsg'), subj)
				return null
			} else {
				return e
			}
		})

	$.timer.check('Загрузка скрипта')

   /* DOM Startup */
   $.on('ready', function () {

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
		$.timer.init()
		$.to('ready',1)
	} catch (e) { 
		$(function () {
			$.timer.init()
			$.to('ready',1)}) }
})(jQuery);

/** imagesUnfolding - Раскрытие изображений

    Развертка изображений которые обернуты ссылками, ведущими на оригиналы */
;(function ($) {
	function testThumb (subj) {
      return subj.is('img')
         && ({jpeg:1,jpg:1,png:1,gif:1,tiff:1,bmp:1})
      [subj.closest('a').attr('href').
       replace(/^.*\.(\w+)$/,'$1').toLowerCase()]
   }
	   function prepareFull (subj) {
      return '<img src="' + subj.closest('a').attr('href') + '" ' +
         'style="min-width:' + subj.attr('width') + 'px;' +
         'min-height:' + subj.attr('height') + 'px;" ' + 
			'class="penImageFull" >'
   }

   function toggleFull (subj) {
      if (!subj.attr('altimg'))
         var t = prepareFull(subj)
		else
         var t = subj.attr('altimg')
		
      subj.removeAttr('altimg')
      var alt = $(t).attr('altimg', subj.parent().html())
      subj.replaceWith(alt)
   }
	$.on(
      'click',
      function (e) {
         var subj = $(e.target)
         if (e.which == 1 && testThumb(subj)) {
				e.stopPropagation()
				e.preventDefault()
            toggleFull(subj)
            return null
         } else {
            return e
         }
      })
})(jQuery);

/** cache - Кэш

    Хранилище страничек, загруженных ajaxом. */
;(function ($) {
	   var cache = {}
		var bad = {}

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
			"",
         function (responseText, textStatus, XMLHttpRequest) {
            if (textStatus == 'timeout') {
               data.wtf = textStatus
               return $.to('fail', data)
            }
            if (({success:1,notmodified:1})[textStatus]) {
               cache[url] = part
            } else {
               bad[url] = true
            }
            return $.to('/r/ cache', data)
         })
   })
})(jQuery);

/** posts - Post deliveri service

    Получение сообщений по ссылке */
;(function ($) {
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
			if (data.senttocache || addr[0] == '') {
				data.wtf = 'Post not found in pointed url'
				return $.to('fail', data)
			} else {
				data.senttocache = 1
				return $.to('/r/ cache', data)
			}
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
})(jQuery);

/** postsPreview - Превью сообщений

    Генерация превью сообщений при наведении на ссылку (раньше называлось intelliSense). */
;(function ($) {
	
		var raiseDelay = 100;
		var fallDelay = 100;

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
      'fail',
      function (data) {
         if (data.preview) {
            showPreview(
               $.makeBox('Ошибка: ' + data.wtf).
						addClass('penPreviewTmp'),
               data.preview.x,
               data.preview.y)
         }
			return data
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
	   x+=12
		y+=12
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
         if (subj[0].tagName && subj[0].tagName == 'A' && 
				 subj.is('a:contains("' + $.ss.refsep +'")')) {
				clearTimeout(t)
            t = setTimeout(
               function () {
                  $.to('/r/ post', {href: subj.attr('href'), ctx: document,
                                    preview: {x: e.pageX, y: e.pageY}})
               }, raiseDelay)
				e.stopPropagation()
            return null
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
         if ((subj[0].tagName && subj[0].tagName == 'A' && 
				  subj.is('a:contains("' + $.ss.refsep + '")')) 
				|| subj.closest('.penPreview').length) {
				clearTimeout(t)
            t = setTimeout(
               function () {
                  $('.penPreview, .penPreviewTmp').remove()
               }, fallDelay)
				e.stopPropagation()
            return false
         } else {
            return e
         }
      })
})(jQuery);

