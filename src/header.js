// ==UserScript== 
// @name           Govno 3 aka penochka
// @version        UnStAbLe
// @description    Penochka imgboard script.
// @include        http://iichan.ru/*
// @include        http://*.iichan.ru/*
// @include        http://02ch.su/*
// @include        http://*.02ch.su/*
// @include        http://2-ch.ru/* 
// @include        http://*.2-ch.ru/* 
// @exclude        */src/* 
// @run-at         document-start
// ==/UserScript==

/**
 * timer.js - small timer wrapper.
 */
var scope = {}

if(typeof unsafeWindow === "object") {
   scope = unsafeWindow;
} else {
   scope = window;
}

scope.timer = {
   time : 0,
   total : 0,
   init : function() {
      var d = new Date();
      this.time = d.getTime();
   }, diff : function(str) {
      var d = new Date();
      d = d.getTime() - this.time;
      this.total += d;
      this.cache += str + ': ' + d + 'ms; ';
   },
   cache : ''
}

scope.timer.init()
