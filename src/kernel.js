/**
 * @module kernel
 * @title Ядро пеночки
 * @descr Базовые функции скрипта и некоторые глобальные переменные
 * @depends header jquery
 */

$ = Pnchk = this.$

var events = {}

/*jQuery show function fix */
$.extend($.fn, {
	show: function () {
		$(this).each(
			function (){ 
				this.style.display=''
			});
		return this
	}
})

$.extend({
   on:function(evname, fun, top) {
      evname = $.makeArray(evname)
      for (var i = 0; i < evname.length; i++) {
         try {
            if(top)
               events[evname[i]].unshift(fun)
            else
               events[evname[i]].push(fun)
         } catch (err) {
            events[evname[i]] = [fun]
         }
      }
   },
   to: function (evname, cookie) {
		if (arguments.length == 1)
			cookie = true
		if (!events[evname])
			return cookie
      for(var i = 0; cookie != null && i < events[evname].length; i++)
         cookie = events[evname][i](cookie)
      return cookie
   }
})

$.extend($.fn,{
   swap: function(b){
      b = jQuery(b)[0]
      var a = this[0];
      var t = a.parentNode.insertBefore(document.createTextNode(''), a);
      b.parentNode.insertBefore(a, b);
      t.parentNode.insertBefore(b, t);
      t.parentNode.removeChild(t);
      return this;
   }
});

$.extend({
   timer:{
      time: __startup,
      total: 0,
      init: function() {
         this.time = (new Date()).getTime();
      }, check : function(str) {
         var delta = (new Date()).getTime() - this.time
         this.total += delta;
         this.cache += str + ': ' + delta + 'мсек; ';
         this.time = (new Date()).getTime()
      },
      cache : ''
   },
   time: function (test) {
      var start = (new Date).getTime()
      test();
      return (new Date).getTime() - start
   }
})

$.extend({
   cfg:{}, i18n:{}, iom:{}
})
