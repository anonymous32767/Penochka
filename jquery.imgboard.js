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

function dvach () {
   function parse (cloned) {
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
   }
   
   function process(cloned) {
      cloned.anchors().each(
	 function () {
	    [refurl, refid] = $(this).attr('href').split('#')
	    var pid = 'p' + refid
            $(this).attr('refid', pid) 
	    $(this).attr('refurl', refurl)
	    if(!$.references[pid]) {
	       $.references[pid] = []
	    }
	    $.references[pid].push($(this).pid())
	 }
      )
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
   }

   jQuery.fn.extend({
      anchor:
      function() {
	 return $(this).find('a[name]')   
      },
      
      image:
      function() {
	 return $(this).find('a img')   
      },
      
      imageinfo:
      function() {
	 return $(this).find('span.filesize')   
      },
      
      msg:
      function() {
	 return $(this).find('blockqoute')   
      },
      
      reflink:
      function() {
	 return $(this).find('span.reflink')   
      },
      
      title:
      function() {
	 return $(this).find('span.replytitle')   
      },
      
      username:
      function() {
	 return $(this).find('span.commentpostername')   
      },
      
      pid:
      function() {
	 if ($(this).hasClass('penPost')) {
            return $(this).attr('id')
	 } else {
            return $(this).parents('.penPost').attr('id')   
	 }
      },
      
      tid:
      function() {
	 if ($(this).hasClass('penThread')) {
            return $(this).attr('id')
	 } else {
            return $(this).parents('.penThread').attr('id')
	 }
      },
      
      anchors:
      function() {
	 return $(this).find('blockquote a[onclick]')
      },
      
      threads:
      function() {
	 return $(this).find('.penThread')
      },
      
      posts:
      function() {
	 return $(this).find('.penPost')
      },
      
      references:
      function(pid) {
	 return $(this).find("a[refid='"+pid+"']")
      },

      menu:
      function() {
	 return $(this).find('div.adminbar')
      },

      options:
      function() {
	 return $(this).find('#penOptions')
      },
      user:
      function () {
	 return $(this).find('input[name=akane]')
      },
      email: 
      function () {
	 return $(this).find('input[name=nabiki]')
      },
      title: 
      function () {
	 return $(this).find('input[name=kasumi]')
      },
      postmessage:
      function () {
	 return $(this).find('textarea[name=shampoo]')
      },
      file:
      function () {
	 return $(this).find('input[name=file]')
      },
      captcha:
      function () {
	 return $(this).find('input[name=captcha]')
      },
      passwd:
      function () {
	 return $(this).find('input[name=password]')
      }
   });

   jQuery.xlatb = xlatb;
   jQuery.references = [];

   jQuery.ui = {
      anchor :
      function(pid) {
	 var pnum = pid.replace('p','')
	 return '<a href="#'+pnum+'" refid="'+pid+'" onclick="highlight('+pnum+')">&gt;&gt;'+pnum+'</a>'
      },
      refs :
      function (content) {
	 return '<blockquote><small>Ссылки '+content+'</small></blockquote>'
      },
      preview :
      function (id,x,y,url) {
	 if($('#is'+id).attr('id')) {
	    return false;
	 }
	 var obj = $('#'+id).clone()
	 if(!obj.attr('id')) {
	    var e = $('<span/>')
	    e.load('http://'+location.host + url + ' #delform',
		   {},
		   function (a,b,c) {
		      var cloned = $(e).find('#delform')
		      parse(cloned)
		      $('#cache').append(e)
		      $('#is'+id).remove()
		      intelli(x,y,id,url)
		   })
	    obj = $('<div>Loading...</div>')
	 }
	 process(obj) 
	 obj.anchor().remove()
	 obj.addClass('reply')
	 obj.attr('style','position:absolute; top:' + y + 
		  'px; left:' + x + 'px;display:block;')
	 return obj
      },
      closeLink : 
      function(id, title) {
	 return "[<a href=\"javascript:toggle(\'" + 
	    id + "\')\">"+title+"</a>]"
      },
      tizer : 
      function(id,body) {
	 return "<div id=\'tiz" + id + 
	    "\' style='display:none;'>" + body + "<br clear='both' /><hr></div>"
      } 
   };

   return function (obj,f) {
      const css = '#penOptions {padding: 8px} #penOptions div {margin-left: 8px;} #penOptions div div {margin-left: 16px;} .penOpt2 {padding-left: 8px;float:right} .penOpt2 input{width:64px}';

      var threadsRaw = obj.find('#delform');
      var cloned = threadsRaw.clone();
      
      parse(cloned);
      process(cloned);
      
      $('body').prepend('<div id="penOptions" class="reply" style="display:none;position:fixed;"><h3 style="margin:0;float:left">Options</h3><span class="penOpt2">[<a href="javascript:db.saveCfg();toggle(\'penOptions\')">Save and exit</a>]</span><br clear="both"/></div>');
      $('div.adminbar').append('[<a href="javascript:toggle(\'penOptions\')">Options</a>]')
      $('body').append('<div id="cache" style="display:none" />')
      addStyle(css)
      f(obj, cloned)
      threadsRaw.replaceWith(cloned); 
   };
}/* end of 2ch */

var converge = {}

jQuery.fn.extend({
   a: function () {
      return $(this).parents('a:first');
   }, 
   ok: function(f) {
      this.ready(
         function () {
            converge = dvach()
	    converge($(this), f)
         }
      )
   }
})