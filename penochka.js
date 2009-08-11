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

var scheme = {
   sageMan: {
      v: false,
      capsBold: false,
      inAllFields: true
   },
   hideThreads: true,
   hidePosts: false,
   goodStealth: false,
   unfoldImages: true,
   intelliSense: {
      v: false,
      intelliFallback: 100
   },
   State: {
      ExpirationTime: 3
   }
}

/* */
function toggle(id) {
   $('#'+id).toggle()
   $('#tiz'+id).toggle() 
   db.saveState()
}

/* */
function swapAttr(obj, a1, a2) {
   var t = obj.attr(a1)
   obj.attr(a1, obj.attr(a2))
   obj.attr(a2, t)
}

function refold(id) {
   var obj = $('#'+id).image()
   swapAttr(obj, 'style', 'altstyle')
   swapAttr(obj, 'src', 'altsrc')
   return false;
}

/* */
function apply_isense(a) {
   a.attr('onmouseover','intelli(event.pageX+10, event.pageY+10,\''+a.attr('refid')+'\',\''+a.attr('refurl')+'\')')
   a.attr('onmouseout','outelli(\''+a.attr('refid')+'\')')
}

var z = 0;

function intelli(x,y,id,url) {
   var obj = $.ui.preview(id,x,y,url)
   if(obj) {
      obj.anchors().each(
         function () { apply_isense($(this)) }
      ) 
      obj.attr('id','is'+id);
      obj.css('z-index', z++);
      $('body').prepend(obj);
   }
}

function outelli(id) {
   setTimeout(
      function () {
	 $('#is'+id).remove()
      }, 
      db.config.intelliSense.intelliFallback
   );
}

function sage(env) {
   if(!env) {
      env = $('body')
   }
   env.email().val('sage')
   if (db.config.sageMan.inAllFields) { 
      env.user().val('sage')
      env.title().val('sage') 
      db.config.sageMan.capsBold &&
	 env.postmessage().val('**SAGE**')
   }
}

/* */
db.load(scheme)

$(document).ok(
   function (env, messages) {
      db.config.hidePosts &&
      messages.posts().each(
         function () {
            var pid = $(this).pid()
            $(this).reflink().after($.ui.closeLink(pid, 'Скрыть'))
            if(!db.config.goodStealth) {
	       var txt = 'Пост ' + pid.replace('p','№') + 
		  ' скрыт. [<a href="javascript:toggle(\''+pid+'\')">Показать</a>]';
               $(this).before($.ui.tizer(pid, txt))
	    }
         }
      )
      db.config.hideThreads &&
      messages.threads().each(
         function () {
            var tid = $(this).tid()
            $(this).reflink().filter(':first').after($.ui.closeLink(tid, 'Скрыть тред'))
            if(!db.config.goodStealth) {
	       var txt = 'Тред ' + tid.replace('t','№') +
		  ' скрыт. [<a href="javascript:toggle(\''+tid+'\')">Показать</a>]';
               $(this).before($.ui.tizer(tid,txt))
	    }
         }
      ) 
      db.config.unfoldImages &&
      messages.image().each(
         function () {
            var a = $(this).a()
            a.attr('onclick','return refold(\''+a.pid()+'\')')
            a.removeAttr('target')
         }
      ) 
      db.config.intelliSense.v &&
      messages.anchors().each(
         function () { apply_isense($(this)) }
      ) 
      env.email().after(' <b>[<a href="javascript:sage()">Sage</a>]</b>')
      if (db.config.sageMan.v) { 
	 sage(env) 
      } 
      for(var objId in db.hidden) {
         /* It's an low level alternative of toggle method
          * TODO Rewrite toggle for suitable usage in this
          * place (may be impossible). */
         messages.find('#'+objId).css('display','none')
         db.config.goodStealth ||
         messages.find('#tiz'+objId).css('display','block')
      }
      env.options().append(db.genForm())

      var captcha = env.captcha()
      captcha.keypress(
	 function (key) {
	    var recoded = $.xlatb[String.fromCharCode(key.which).toLowerCase()]
	    if (recoded) {
	       /* Not a perfect piece of code, but 
                  i'm thank you eurekafag (: */
	       var caret = key.target.selectionStart
	       var str = captcha.val()
	       captcha.val(str.substring(0,caret) + recoded + str.substring(caret))
	       key.target.selectionStart = caret+1
	       key.target.selectionEnd = caret+1
	       return false
	    }
	 }
      )
   } 
) 