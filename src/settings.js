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

function isEmpty(obj) {
   for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
         return false;
   }
   return true;
}

var defaults = {
   forwardReferences: {
      v: [true, 'Карта дискуссии'],
      asDog: [false, 'В виде собаки']
   },
   unfoldImages: [true,'Развертывать изображения'],
   fitImages: [true,'Подгонять изображения под ширину экрана'],
   unfoldThreads: [true, 'Кнопка развертывания треда'],
   threadMenu: [true, 'Меню треда'],
   citeInTitle: [true, 'Показывать цитату оп-поста в заголовке страницы'],
   form: {
      v: [true,'<b class="penBig">Форма ответа</b>'],
      showInThread: [true, 'Показывать по клику на номере сообщения'],
      moveAtEnd: [true, 'Переносить форму ответа в конец треда'],
      hideInIndex: [false, 'Скрывать верхнюю форму в индексе'],
      tripleCaptcha: [false, 'Дублировать капчу'],
      sageButton: [true, 'Кнопка сажи'],
      formatButtons: [true, 'Кнопки форматирования'],
      useAJAX: [true, 'Использовать AJAX']
   },
   intelliSense: {
      v: [true,'<b class="penBig">Intellisense</b>'],
      ajax: [true, 'Автоматически подгружать пропущенные сообщения'],
      fallback: [100,'Замедление на отпадание'],
      raiseup: [0,'Замедление на срабатывание']
   },
   sage: {
      v: [undefined, '<b class="penBig">Сажа</b>'],
      sageMan: [false, 'Я &#8212; человек-<b>САЖА</b>'],
      capsBold: [false, '<b>КАПСБОЛД</b>'],
      inAllFields: [false, 'Сажа идет во все поля']
   },
   hiding: {
      v: [undefined, '<b class="penBig">Скрытие</b>'],
      threads: [true,'Скрытие потоков'],
      citeLength: [35, 'Показывать цитату из оп-поста, букв'],
      posts: [false,'Скрытие сообщений'],
      goodStealth: [false,'Аккуратно скрывать']
   },
   state: {
      v: [undefined,'<b class="penBig">Хранение данных</b>'],
      constPasswd: ['', 'Постоянный пароль'],
      expirationTime: [3,'Хранить информацию о скрытых тредах, дн.']
   },
   censore: {
      v: [false, '<b class="penBig">Фильтрация</b>'],
      username: ['', 'Имя пользователя'],
      title: ['', 'Заголовок'],
      email: ['', 'Электропочта (сажа)'],
      msg: ['', 'Текст сообщения'],
      total: ['', 'Всё сообщение']
   },
   bookmarks: {
      v: [true,'<b class="penBig">Закладки</b>'],
      citeLength: [55, 'Длина цитаты из оп-поста в закладках'],
      autoAdd: [true, 'При ответе в тред закладывать его автоматически']
   }
}

var db = {
   config:{
   },
   hidden: {
   },
   filtered: {
   },
   getval:
   function (pfx,obj) {
      for(var i in pfx) {
         obj = obj[pfx[i]]
         if(!obj) {
            return undefined;
         }
      }
      return obj
   },
   setval:
   function (pfx,o,v) {
      var hd = pfx.slice(0,1)[0]
      var tl = pfx.slice(1)
      if(tl[0]) {
         if (!o[hd]) {
            o[hd] = {}
         }
         db.setval(tl,o[hd],v)
      } else {
         o[hd] = v
      }
   },
   getinp:
   function (key) {
      var e = $('#penSet' + key)
      switch (e.attr('type')) {
      case 'checkbox':
         return e.attr('checked') ? true : false;
         break;
      case 'text':
         return  e.attr('value');
         break;
      }
   },
   setinp:
   function (key,val) {
      var e = $('#penSet' + key)
      switch (typeof val) {
      case 'boolean':
         if (val) {
            e.attr('checked','checked')
         } else {
            e.removeAttr('checked')
         }
         break;
      case 'number':
      case 'string':
         return  e.attr('value', val);
         break;
      }
   },
   __iter:
   function (list, f, p) {
      for (var key in list) {
         var pfx = p.slice(); /* slice is a stupid array copy in js */
         pfx.push(key)
         if (list[key] instanceof Array) {
            f(list[key],pfx)
         } else {
            this.__iter(list[key],f,pfx)
         }
      }
   },
   loadCfg:
   function (defs) {
      var gcfg = $.evalJSON($.cookie('penCfgGlobal')) || {};
      var lcfg = $.evalJSON($.cookie('penCfg')) || {};
      this.hidden = $.evalJSON($.cookie('penHidden')) || {};
      var i = 0;
      var sv = this.setval;
      var cfg = {};
      this.__iter(
         defs,
         function (v,pfx) {
            var nv = []
            nv[0] = v[0]
            nv[1] = v[1]
            sv(pfx, cfg, nv)
            nv.push(i);
            if (typeof lcfg[i] != 'undefined') {
               nv[0] = lcfg[i]
               nv.push('local')
            } else if (typeof gcfg[i] != 'undefined') {
               nv[0] = gcfg[i]
            }
            i++
         },
         []
      )
      this.config = cfg
   },
   saveCfg:
   function (defs) {
      var lcfg = [];
      var gcfg = [];
      db.__iter(
         db.config,
         function (v,pfx) {
            var iv = db.getinp(v[2])
            var dv = db.getval(pfx,defs)[0]
            if($('#penSetLoc' + v[2]).attr('checked') == 'checked') {
               lcfg[v[2]] = iv
            } else {
               if(iv != dv) {
                  gcfg[v[2]] = iv
                  lcfg.splice(v[2], 1)
               } else {
                  gcfg.splice(v[2], 1)
                  lcfg.splice(v[2], 1)
               }
            }
         },
         []
      )
      if(!isEmpty(gcfg)) {
         $.cookie('penCfgGlobal', $.toJSON(gcfg), {path: '/', expires: 9000})
      } else {
         /* Negative expiration time deletes cookie */
         $.cookie('penCfgGlobal', '', {path: '/', expires: -1})
      }
      if(!isEmpty(lcfg)) {
         $.cookie('penCfg', $.toJSON(lcfg), {expires: 9000})
      } else {
         /* Here too */
         $.cookie('penCfg', '', {expires: -1})
      }
   },
   saveState:
   function () {
      var out = {};
      var t = new Date().getTime()
      var presistentHidden = $('.penThread:visible .penPost:hidden, .penThread:hidden');
      presistentHidden.each(
         function () {
	    var id = $(this).attr('id')
            if (!db.filtered[id]) { out[id] = t }
         }
      )
      for (var i in this.hidden) {
         if (!out[i] && (t - this.hidden[i]) < this.config.state.expirationTime[0]*86400 && $('#'+i).is(':hidden')) {
            out[i] = this.hidden[i]
         }
      }
      this.hidden = out;
      $.cookie('penHidden',$.toJSON(this.hidden),{expires: 9000});
   },
   __form: "",
   genForm:
   function () {
      var obj = this;
      var genf =
         function (desc, key, val, loc, add) {
            var locchk = $('<span class="penLoc">')
            var defbtn = $('<span class="penDef">')
            var result = $('<span class="penVal">')
            if(typeof val != 'undefined') {
               locchk.append(
                  '<input type="checkbox" ' +
                     (loc ? 'checked="checked"' : '') +
                     'id="penSetLoc'+key+'" /> Локально')
               defbtn.append(
                  $('<input type="button" value="По умолчанию" />').
                     click(
                        function () {
                           settingsDefault(defaults,key)
                        }))
            }
            switch (typeof val) {
            case 'boolean':
               result.append(
                  '<input type="checkbox" id="penSet' + key + '" ' +
                     (val ? 'checked="checked"' : ' ') + '>')
               break;
            case 'number':
            case 'string':
               result.append(
                  '<input type="text" id="penSet' + key + '" ' +
                     'value="' + val + '">')
               break;
            default:
               break;
            }
            var tab = $('<div class="penRow">')
            tab.append('<span class="penDesc">' + desc + '</span>').
               append(defbtn).
               append(locchk).
               append(result)
            return [tab, add ? $('<div class=penTab>').append(add) : '']
         }
      var walk_n_gen =
         function (list) {
            var out = $('<span/>');
            var t = [];
            for (var key in list) {
               if (key == 'v') {
                  continue
               }
               if (list[key] instanceof Array) {
                  t = genf(list[key][1], list[key][2], list[key][0], list[key][3], '')
               } else {
                  t = genf(list[key].v[1], list[key].v[2], list[key].v[0], list[key].v[3], walk_n_gen(list[key]))
               }
               for(var k in t) {
                  out.append(t[k])
               }
            }
            return out
         }

      if (!this.__form) {
         this.__form = walk_n_gen(db.config);
         this.__form.append('<hr/><hr/>')
      }
      return this.__form
   }
}

function settingsShow () {
   if ($('#penSettings').length == 0) {
      $.ui.window(
         'penSettings',
         'Два.ч - Настройки',
         $.ui.multiLink([
            ['Сохранить и закрыть',
             function () { db.saveCfg(defaults); settingsHide() }]
         ])).
         append(db.genForm())
   }
   $('#penSettings').show();
   return false;
}

function settingsHide() {
   $('#penSettings').hide();
   return false;
}

function settingsToggle(e) {
   $(e).parents('table:first').find('tr:last').toggle()
   return false;
}

function settingsDefault(defs, sid) {
   db.__iter(
      db.config,
      function (v,pfx) {
         if (v[2] == sid) {
            db.setinp(sid, db.getval(pfx, defs)[0])
         }
      },
      [])
}

function storeBookmarks () {
   var bm = []
   for(var i in $.bookmarks) {
      if(!$.bookmarks[i])
         continue
      bm.push(i)
      bm.push($.bookmarks[i])
   }
   $.cookie('penBms', b64encode(bm.join('|')),{path: '/', expires: 9000});
}

function loadBookmarks () {
   try {
      var bm = b64decode($.cookie('penBms')).split('|')
      for(var i = 0; i < bm.length; i+=2) {
         $.bookmarks[bm[i]] = bm[i + 1]
      }
   } catch (err) {}
}

function genBookmarks () {
   var bmarks = $('<span id="penBmsIn">')
   var id = 0;
   for(i in $.bookmarks) {
      if (!$.bookmarks[i])
         continue
      var bm = $('<div class="penDesc"> /' + i.replace(/.*?(\w+).*/, '$1') + '/ <a class="penBmLink" href="' + i + '">' + i.replace(/.*?(\d+).*/, '$1') + '</a> ' + $.bookmarks[i] + '</div>')
      bmarks.append(bm.prepend(
         $.ui.multiLink([
            ['x',
             function (evt) {
                var subj = $(evt.target).parents('div:first')
                $.bookmarks[subj.find('a.penBmLink').attr('href')] = null
                storeBookmarks ()
                subj.remove()
             }]
         ])
      ))
      id++
   }
   return bmarks
}

function toggleBookmarks () {
   if ($('#penBms').length == 0) {
      $.ui.window(
         'penBms',
         'Два.ч - Закладки',
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
