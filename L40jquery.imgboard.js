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


/* State machine here - walks through siblings and add it to
   specific IOM element. 

   All posts on 2-ch except of oppost fold into <td> tag. So
   it isn't need to fold it into anything. Simply find this
   <td> and apply our id. 
      
   Now function destructive - it's overrides native id's of
   elements.
*/
var ib2ch = {
css: '#penOptions {padding: 8px} #penOptions div {margin-left: 8px;} #penOptions div div {margin-left: 16px;} .penOpt2 {padding-left: 8px;float:right} .penOpt2 input{width:64px} .penInj:before{content: "["} .penInj:after{content: "]"}',

converge: function (obj,f) {
   var threadsRaw = obj.find('#delform');
   var cloned = threadsRaw.clone();

   var opPost = $('<span></span>');
   var currThread = $('<span></span>');
   cloned.contents().each(
      function () {
         if ($(this).is('table')) {
            if (opPost) {
               currThread.append(opPost);
               opPost = false;
            }
            $(this).attr('id', 'p' + $(this).find('a[name]').attr('name'));
            $(this).addClass('penPost');
         }
         if(opPost) {
            opPost.append(this);
            if($(this).is('a') && $(this).attr('name')) {
               currThread.attr('id', 't'+$(this).attr('name'));
               currThread.addClass('penThread');
               opPost.attr('id', 'p'+$(this).attr('name'));
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
            opPost = $('<span></span>');
            currThread = $('<span></span>');
         } 
      }
   );
   cloned.append(currThread);
   cloned.image().each(
      function () {
         var altsrc = $(this).a().attr('href')
         var w = $(this).attr('width')
         var h = $(this).attr('height')
         $(this).attr('altsrc',altsrc)
         $(this).attr('style','height: '+h+'px; width:'+w+'px;')
         $(this).attr('altstyle','display:block;clear: both;min-height: '+h+'px; min-width: '+w+'px')
         $(this).removeAttr('height')
         $(this).removeAttr('width')
      }
   )
   cloned.anchors().each(
      function () {
         $(this).attr('refid', 'p'+$(this).text().replace(/>>(\d+)/, "$1")) 
      }
   )
   $('body').prepend('<div id="penOptions" class="reply" style="display:none;position:fixed;"><h3 style="margin:0;float:left">Options</h3><span class="penOpt2">[<a href="javascript:db.saveCfg();toggle(\'penOptions\')">Save and exit</a>]</span><br clear="both"/></div>');
   $('div.adminbar').append('<span class="penInj"><a href="javascript:toggle(\'penOptions\')">Options</a></span>')
   addStyle(this.css )
   f(obj, cloned)
   threadsRaw.replaceWith(cloned);
},

anchor:
   function(obj) {
      return obj.find('a[name]')   
   },

image:
   function(obj) {
      return obj.find('a img')   
   },

imageinfo:
   function(obj) {
      return obj.find('span.filesize')   
   },

message:
   function(obj) {
      return obj.find('blockqoute')   
   },

reflink:
   function(obj) {
      return obj.find('span.reflink')   
   },

title:
   function(obj) {
      return obj.find('span.replytitle')   
   },

username:
   function(obj) {
      return obj.find('span.commentpostername')   
   },

pid:
   function(obj) {
      if (obj.hasClass('penPost')) {
         return obj.attr('id')
      } else {
         return obj.parents('.penPost').attr('id')   
      }
   },

tid:
   function(obj) {
      if (obj.hasClass('penThread')) {
         return obj.attr('id')
      } else {
         return obj.parents('.penThread').attr('id')
      }
   },

anchors:
   function(obj) {
      return obj.find('a[onclick]')
   },

threads:
   function(obj) {
      return obj.find('.penThread')
   },

posts:
   function(obj) {
      return obj.find('.penPost')
   },
menu:
   function(obj) {
      return obj.find('div.adminbar')
   },
options:
   function(obj) {
      return obj.find('#penOptions')
   },
/* UI */
   preview :
   function (id,x,y) {
      var obj = $('#'+id).clone()
      obj.anchor().remove()
      obj.addClass('reply')
      obj.attr('style','position:absolute; top:' + y + 
	       'px; left:' + x + 'px;display:block;')
      return obj
   },
   closeLink : 
   function(id) {
      return "<span class='penInj'><a href=\"javascript:toggle(\'" + 
	 id + "\')\">X</a></span>"
   },
   tizer : 
   function(id) {
      return "<div id=\'tiz" + id + 
	 "\' style='display:none;' class='penInj reply'>Object " + 
	 id + " <a href=\"javascript:toggle(\'" + id + 
	 "\')\">Show</a></div>"
   }
};/* end of 2ch namespace*/


$.fn.extend({
   ok: function(f) {
      this.ready(
         function () {
            ib2ch.converge($(this), f)
         }
      )
   },
   anchor: function() {
      return ib2ch.anchor($(this))
   },
   anchors: function() {
      return ib2ch.anchors($(this))
   },
   image: function() {
      return ib2ch.image($(this))
   },
   imageinfo: function() {
      return ib2ch.imageinfo($(this))
   },
   message: function() {
      return ib2ch.message($(this))
   },
   reflink: function() {
      return ib2ch.reflink($(this))
   },
   title: function() {
      return ib2ch.title($(this))
   },
   username: function() {
      return ib2ch.username($(this))
   },
   pid: function() {
      return ib2ch.pid($(this))
   },
   tid: function() {
      return ib2ch.tid($(this))
   },
   posts: function() {
      return ib2ch.posts($(this))
   },
   threads: function() {
      return ib2ch.threads($(this))
   },
   a: function() {
      return $(this).parents('a:first')
   },
   menu: function() {
      return ib2ch.menu($(this))
   },
   options: function() {
      return ib2ch.options($(this))
   }
});

jQuery.ui = {
   closeLink : function(id) {
      return ib2ch.closeLink(id)
   },
   tizer : function(id) {
      return ib2ch.tizer(id)
   },
   preview : function(id,x,y) {
      return ib2ch.preview(id,x,y)
   } 
}
