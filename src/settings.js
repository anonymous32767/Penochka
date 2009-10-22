/*
 * vim: ts=3 sts=3 cindent expandtab
 * settings.js - penochka preferences system.
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

var db = {
   ready: false,
   cfg: {},
   dflt: {},
   name: {},
   objs: {},
   roots: [],
   children: {},
   hidden: {},
   filtered: {},
   bookmarks: {},
   global: {
      domain: '',
      board: ''
   },
   s : function (id, title, parent, defval, description, examples) {
      if (typeof defval != 'object') {
	 this.objs[id] = defval
	 for(var i in defval) {
	    this.cfg[id] = defval[i]
	    this.dflt[id] = defval[i]
	    break
	 }
      } else if (typeof defval != 'undefined') {
	 this.cfg[id] = defval
	 this.dflt[id] = defval
      }
      this.name[id] = title
      if (parent) {
      if (!this.children[parent]) {
	 this.children[parent] = []
      }
      this.children[parent].push(id)
      } else {
	 this.roots.push(id)
      }
   },
   init : function () {
      /* Группы настроек */
      this.s ('feats', 'Возможности');
      this.s ('form',  'Форма ответа');
      this.s ('sage',  'Сажа');
      this.s ('cens',  'Фильтрация');
      this.s ('view',  'Оформление');
      this.s ('sys',   'Системные');
      this.s ('ftune', 'Тонкие настройки');

      /* Теперь сами настройки */
      this.s ('hide', 'Скрытие', 'feats');
      this.s ('thrdHide', 'Потоков', 'hide', true);
      this.s ('pstsHide', 'Сообщений', 'hide', true);
      this.s ('iSense', 'Превью цитируемых (>>) сообщений', 'feats', true);
      this.s ('fwdRefs', 'Обратные ссылки', 'feats', true);
      this.s ('imgsUnfold', 'Развертывание картинок', 'feats', true);
      this.s ('thrdUnfold', 'Развертывание тредов', 'feats', true);
      this.s ('thrdMenu', 'Меню треда', 'feats', true);
      this.s ('constPwd', 'Постоянный пароль на удаление', 'feats', '')
      this.s ('bmarks', 'Закладки', 'feats', true)

      this.s ('fastReply', 'Быстрый ответ', 'form', true);
      this.s ('thrdMove', 'Переносить вниз, находясь в треде', 'form', true);
      this.s ('idxHide', 'Скрывать, находясь на главной', 'form', false);
      this.s ('sageBtn', 'Кнопка сажи', 'form', true);
      this.s ('fmtBtns', 'Кнопки форматирования', 'form', true);
      this.s ('tripleTt', 'Троировать капчу', 'form', true);

      this.s ('sageMan', 'Я &#8212; человек-<b>САЖА</b>', 'sage', false);
      this.s ('sageInAllFields', 'Сажа идет во все поля', 'sage', false);

      this.s ('compact', 'Компактное отображение', 'view', true);

      this.s ('censTitle', 'Заглавие', 'cens', '');
      this.s ('censUser', 'Имя пользователя', 'cens', '');
      this.s ('censMail', 'E-mail (sage)', 'cens', '');
      this.s ('censMsg', 'Текст сообщения', 'cens', '');
      this.s ('censTotal', 'Любое место сообщения', 'cens', '');

      this.s ('useAJAX', 'Использовать асинхронный яваскрипт', 'sys', true);

      this.s ('hidePure', 'Скрывать без следа', 'ftune', false);
      this.s ('censPure', 'Скрывать отфильтрованное без следа', 'ftune', true);
      this.s ('fitImgs', 'При развертывании подгонять картинки по ширине', 'ftune', true);
      this.s ('citeInTitle', 
	       'Показывать цитату из треда в заголовке страницы (&lt;title&gt;)', 
	       'ftune', true);
      this.s ('hideCiteLen', 'Размер цитаты скрытых объектов', 'ftune', 55);
      this.s ('ttlCiteLen', 'Размер цитаты в заголовке', 'ftune', 55);
      this.s ('bmCiteLen', 'Размер цитаты в закладках', 'ftune', 55);
      this.s ('delay', 'Замедление в создании превью', 'ftune');
      this.s ('iSenseUp', 'На притяжение', 'delay', 0);
      this.s ('iSenseDn', 'На отпадание',  'delay', 200);
      this.s ('bmAutoAdd', 'Автоматически добавлять тред в закладки при ответе',  'ftune', true);

      this.global.domain = window.location.hostname
      this.global.board = window.location.pathname.replace(/^\/(\w+)\/.*$/, '$1')
      this.ready = true;
   },
   load : function (obj, name) {
      if (!this.ready) {
	 this.init()
      }
      var raw = []
      try {
	 raw = io(name).replace(/\0/,'').split('|')
      } catch (err) { raw = [] }
      /* TODO: Unescape this */
      for (var i = 0; i < raw.length; i+=2) {
	 if (raw[i + 1]) {
	    if (raw[i + 1] == 'false') {
	       obj[raw[i]] = false
	    } else {  
	       obj[raw[i]] = raw[i + 1]
	    }
	 }
      }
   },
   save : function (obj, name) {
      var raw = [];
      /* TODO: Escape this */
      for (i in obj) {
	 raw.push(i)
	 raw.push(obj[i])
      }
      if (raw) {
	 io(name, raw.join('|'))
      } else {
	 io(name, null)
      }
   },
   loadCfg : function () {
      this.load(this.cfg, 'penCfg')
   },
   saveCfg : function () {
      var delta = {};
      for (var i in this.cfg) {
	 if (this.cfg[i] != this.dflt[i]) {
	    delta[i]=this.cfg[i]
	 }
      }
      this.save(delta, 'penCfg')
   },
   loadHidden : function () {
      this.load(this.hidden, 'penHidden'+this.global.board)
   },
   saveHidden : function (board) {
      this.save(this.hidden, 'penHidden'+this.global.board)
   },
   loadBookmarks : function (board) {
      var raw = []
      this.load(raw, 'penBookmarks')
      for(i in raw) {
	    var tc = raw[i].split('#')
	    this.bookmarks[i] = {
	       timestamp : tc.shift(),
	       cite : tc.join('#')
	    }
      }
   },
   saveBookmarks : function (board) {
      var raw = []
      for (var i in this.bookmarks) {
	 raw[i] = this.bookmarks[i].timestamp + '#' + this.bookmarks[i].cite
      }
      this.save(raw, 'penBookmarks')
   }
}