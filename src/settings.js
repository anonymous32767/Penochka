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
		asDog: [true, 'В виде собаки']
	},
   unfoldImages: [true,'Развертывать изображения'],
   unfoldThreadsBtn: [false, 'Кнопка развертывания треда'],
   intelliSense: {
      v: [true,'<h3>Intellisense</h3>'],
		ajax: [true, 'Автоматически подгружать пропущенные сообщения'],
      fallback: [100,'Замедление на отпадание'],
      raiseup: [0,'Замедление на срабатывание']
   },
   sage: {
      v: [undefined, '<h3>Сажа</h3>'],
      sageMan: [false, 'Я &#8212; человек-<b>САЖА</b>'],
      capsBold: [false, '<b>КАПСБОЛД</b>'],
      inAllFields: [false, 'Сажа идет во все поля'],
      button: [true, 'Кнопка сажи']
   },
   hiding: {
      v: [undefined, '<h3>Скрытие</h3>'],
      threads: [true,'Скрытие потоков'],
		citeLength: [15,'Показывать цитату из оп-поста, букв'],
      posts: [false,'Скрытие сообщений'],
      goodStealth: [false,'Аккуратно скрывать']
   },
   state: {
      v: [undefined,'<h3>Хранение данных</h3>'],   
      constPasswd: ['', 'Постоянный пароль'],
      expirationTime: [3,'Хранить информацию о скрытых тредах, дн.']
   },
   censore: {
      v: [false, '<h3>Фильтрация</h3>'],
      username: ['', 'Имя пользователя'],
      title: ['', 'Заголовок'],
      email: ['', 'Электропочта (сажа)'],
      msg: ['', 'Текст сообщения'],
      total: ['', 'Всё сообщение']
   }
}

var db = {
   config:{
   },
   hidden: {
   },
   getval:
   function (pfx,obj) {
      var o = obj
      for(var i in pfx) {
	 o = o[pfx[i]]
	 if(!o) {
	    return undefined;
	 }
      }
      return o
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
               out[$(this).attr('id')] = t
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
	       var locchk = '<input type="checkbox" ' +
		  (loc ? 'checked="checked"' : '') +
		  'id="penSetLoc'+key+'" /> Локально'
	       var defbtn = '<input type="button" value="По умолчанию" onclick="settingsDefault(defaults,\''+key+'\')" />'
	       var result = "";
               switch (typeof val) {
               case 'boolean':
                  result = '<input type="checkbox" id="penSet' + key + '" ' + 
                         (val ? 'checked="checked"' : ' ') + '>'
               break;
               case 'number':
               case 'string':
                  result = '<input type="text" id="penSet' + key + '" ' + 
                        'value="' + val + '">'
               break;
	       default:
		  locchk = ' ';
		  defbtn= ' ';
		  break;
            }
	       return '<table width="100%"><tr><td class="penOptDesc">' +
		  desc + '</td><td class="penOptVal">' + 
		  result + '</td><td class="penOptLoc">' + 
		  locchk + '</td><td class="penOptDef">' +
	          defbtn + '</td><tr><td colspan="4">' +
		  add + '</td></tr></table>'
            }
         var walk_n_gen =
            function (list) {
               var out = "";
               for (var key in list) {
                  if (key == 'v') {
                     continue
                  }
                  if (list[key] instanceof Array) {
                     out += genf(list[key][1], list[key][2], list[key][0], list[key][3], '')
                  } else {
                     out += genf(list[key].v[1], list[key].v[2], list[key].v[0], list[key].v[3], walk_n_gen(list[key]))
                  }
               }
               return out
            }

         if (!this.__form) {
            this.__form = walk_n_gen(db.config);
	    this.__form += '<hr/><hr/>'
         } 
         return this.__form
      }
}

function settingsShow() {
   var e = $('#penSettings');
   if (!e.find('table').is('table')) {
      e.append(db.genForm())
   }
   e.show();
}

function settingsHide() {
   $('#penSettings').hide();
}

function settingsToggle(e) {
   $(e).parents('table:first').find('tr:last').toggle()
}

function settingsDefault(defs,sid) {
   db.__iter(
      db.config,
      function (v,pfx) {
	 if (v[2] == sid) {
	    db.setinp(sid, db.getval(pfx, defs)[0])
	 }
      },
      [])
}