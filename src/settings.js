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
   combos: {},
   roots: [],
   children: {},
   hidden: {},
   filtered: {},
   bookmarks: {},
   global: {
      domain: '',
      board: '',
      time: {}
   },
	cens: null,
   s : function (id, title, parent, defval, description, examples) {
      if (typeof defval == 'object') {
         this.combos[id] = defval
         for(var i in defval) {
            this.cfg[id] = i
            this.dflt[id] = i
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
      this.s ('handleYTube', 'Загружать видео с youtube прямо в сообщение', 'feats', true)
      this.s ('ytubeAutorun', 'Автозапуск', 'handleYTube', true)
      this.s ('ytubeSize', 'Размер окна', 'handleYTube', {normal: 'Средний', little: 'Маленький', big: 'Большой'})
      this.s ('overrideF5', 'Перегружать только активный фрейм по F5', 'feats', true);

      this.s ('taResize', 'Изменять размеры поля ввода сообщения', 'form', true);
      this.s ('taHeight', 'Высота', 'taResize', 12);
      this.s ('taWidth', 'Ширина', 'taResize', 66);
      this.s ('fastReply', 'Быстрый ответ', 'form', true);
      this.s ('thrdMove', 'Переносить вниз, находясь в треде', 'form', true);
      this.s ('idxHide', 'Скрывать, находясь на главной', 'form', false);
      this.s ('sageBtn', 'Кнопка сажи', 'form', true);
      this.s ('fmtBtns', 'Кнопки форматирования', 'form', true);
      this.s ('tripleTt', 'Троировать капчу', 'form', false);
		this.s ('formHiding', 'Скрытие частей формы', 'form');
		this.s ('hideTitle', 'Заголовок', 'formHiding', false);
		this.s ('hideEmail', 'E-mail', 'formHiding', false);
		this.s ('hideUser', 'Имя', 'formHiding', false);
		this.s ('hidePasswd', 'Пароль', 'formHiding', false);
		this.s ('hideGoto', 'Перейти к', 'formHiding', false);
		this.s ('hideRules', 'Правила', 'formHiding', true);

      this.s ('sageMan', 'Я &#8212; человек-<b>САЖА</b>', 'sage', false);
      this.s ('sageInAllFields', 'Сажа идет во все поля', 'sage', false);

      this.s ('compact', 'Компактное отображение', 'view', true);
      this.s ('theme', 'Тема', 'view', {photon: 'Фотон', neutron: 'Нейтрон'});
      this.s ('ntheme', 'Ночная тема', 'view', {photon: 'Фотон', neutron: 'Нейтрон'});
      this.s ('btnsStyle', 'Стиль кнопок форматирования', 'view', {css: 'Графические', text: 'Текстовые'});
      this.s ('hlPrevs', 'Подсвечивать превью ярче', 'view', true);

      /* this.s ('censTitle', 'Заглавие', 'cens', '');
         this.s ('censUser', 'Имя пользователя', 'cens', '');
         this.s ('censMail', 'E-mail (sage)', 'cens', '');
         this.s ('censMsg', 'Текст сообщения', 'cens', ''); */
      this.s ('censTotal', 'Любое место сообщения', 'cens', '');
		this.s ('hideOpEqThrd', 'Отфильтрованное оп-сообщение фильтрует тред', 'cens', false);
      this.s ('censPage', 'Элементы страницы', 'cens', 'a:last, div.logo img, center hr, center a[target], center br');
      /* this.s ('censHeight', 'Высота сообщения превышает', 'cens', 0); */

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
      this.s ('bmAutoDel', 'Автоматически удалять закладку, указывающую на утеряный тред',  'ftune', false);
      this.s ('nightTime', 'Ночной интервал', 'ftune', '22:00-8:00');
      this.s ('prvwMinWidth', 'Минимальная ширина превью сообщения', 'ftune', 450);
      this.s ('prvwMinDelta', 'Дельта ширины превью сообщения', 'ftune', 200);
      this.s ('thrdInThrdLeave', 'Не скрывать тред, когда заходишь в него', 'ftune', false);
      this.s ('thrdMenuDouble', 'Дублировать меню треда внизу треда', 'ftune', true);
      this.s ('bmPreview', 'Показывать превью тредов в закладках', 'ftune', false);
      this.s ('clearTt', 'Очищать поле ввода капчи при ошибке или обновлении', 'ftune', true);

      this.global.domain = window.location.hostname
      this.global.board = window.location.pathname.replace(/^\/(\w+)\/.*$/, '$1')
      this.global.time = new Date()
      this.ready = true;
   },
   load : function (objs, cb) {
      io(objs,
         function (data) {
            var retVal = {}
            for (i in data) {
               retVal[i] = {}
               var raw = []
               try {
                  raw = data[i].split('|')
               } catch (err) { raw = [] }

               for (var j = 0; j < raw.length; j += 2) {
                  if (raw[j])
							try {
								retVal[i][raw[j]] = raw[j + 1].replace(/\&#666;/g, '|')
							} catch (err) {
								retVal[i][raw[j]] = null
							}
               }
            }

            cb(retVal)
         })
   },
   save : function (objs) {
      var raw = [];
      /* TODO: Escape this */
      for (o in objs) {
         for (i in objs[o][0]) {
            raw.push(i)
				try {
					raw.push(objs[o][0][i].replace(/\|/g, '&#666;'))
				} catch (err) {
					raw.push(objs[o][0][i])
				}
         }
         objs[o][0] = raw ? raw.join('|') : null
         raw = []
      }
      return io(objs)
   },
   saveState: function () {
      var cfgDelta = {}
      var bookmarksRaw = {}

      /* Config */
      for (var i in this.cfg)
         if (this.cfg[i] != this.dflt[i]) {
            cfgDelta[i]=this.cfg[i]
         }

      /* Bookamrks */
      for (var i in this.bookmarks)
         bookmarksRaw[i] = this.bookmarks[i].timestamp + '#' + this.bookmarks[i].cite

      return this.save({
         penCfg: [cfgDelta, '/'],
         penHidden: [this.hidden, null],
         penBookmarks: [bookmarksRaw, '/']
      })
   },
   loadState: function (cb) {
      if (!this.ready) {
         this.init()
      }

      var me = this

      this.load({
         penCfg: '',
         penBookmarks: '',
         penHidden: ''
      },
                function (data) {
                   me.hidden = data.penHidden

                   /* Bookmarks */
                   for(i in data.penBookmarks) {
                      var tc = data.penBookmarks[i].split('#')
                      me.bookmarks[i] = {
                         timestamp : tc.shift(),
                         cite : tc.join('#')
                      }
                   }

                   /* Config typing fix */
                   for (i in data.penCfg) {
                      me.cfg[i] = data.penCfg[i]
                   }
                   for (i in me.cfg) {
                      if (typeof me.dflt[i] == 'boolean') {
                         if (me.cfg[i] == 'false') {
                            me.cfg[i] = false
                         } else if (me.cfg[i] == 'true') {
                            me.cfg[i] = true
                         }
                      } else if (typeof me.dflt[i] == 'number') {
                         me.cfg[i] = me.cfg[i] * 1
                         if (me.cfg[i] == NaN)
                            me.cfg[i] = me.dflt[i]
                      }
                   }
						 if (db.cfg.censTotal != '') {
							 try {
								 db.cens = new RegExp(db.cfg.censTotal, 'i')
							 } catch (err) {
								 cb.cens = db.cfg.censTotal
							 }
						 } 
						 
                   cb()
                })
   }
}
