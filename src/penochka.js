/*
 * vim: ts=3 sts=3 cindent expandtab
 *
 * penochka - Various extensions for imageboards,
 *            which powered by jquery.
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

jQuery.fn.swap = function(b){ 
    b = jQuery(b)[0]; 
    var a = this[0]; 
    var t = a.parentNode.insertBefore(document.createTextNode(''), a); 
    b.parentNode.insertBefore(a, b); 
    t.parentNode.insertBefore(b, t); 
    t.parentNode.removeChild(t); 
    return this; 
};

/* Penochka application function variable */
var apply_me = {} 

/* */
/* FIXME 1. Append only where needed
         2. Toggling doesn't work  */
function toggleReplyForm(id) {
   if($('#postForm'+id).attr('id')) {
      $('#postForm'+id).remove()
   }
   var frm = $('body').postform().clone();
   frm.attr('id', 'postForm' + id);
   $('#'+id).moar().append(frm)
}

/* */

function toggleThread(id) {
	$('#'+id).swap('#fold'+id)
}

function unfold(id) {
	var replace =
		function (o,n) {
			apply_me(undefined,n)
			n.reflink().filter(':first').after(
				$.ui.controlLink(
					'[|Скукожить обратно|]',
					function () {
						toggleThread(id)
					})
			)
			o.attr('id', 'fold'+id)
			toggleThread(id)
			wait.swap(moar)
		}

	if($('#fold'+id).length >0) {
		toggleThread(id)
	}

   var o = $('#'+id)
	var url = o.reflink().find('a').attr('href').split('#')[0]
	var moar = o.moar()
	var wait = $('<span>Загрузка треда...</span>')
	moar.swap(wait)
	var cached = $('#cache #'+id)
	if(cached.attr('id')) {
		setTimeout(
			function () {
				replace(o, cached)
			}, 0)
	} else {
		o.ajaxThread(
			url,
			function(e) {
				var ue = e.find('#'+id)
				ue.appendTo('#cache')
				replace(o,ue)
      })
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
   var ofs = obj.offset();
	if(!$("#itiz"+id).attr('id')) {
		obj.one("load",
			function () {
				$('#itiz'+id).hide()
			})
		/* TODO: Move this HTML to jQuery.imgboard.ui */
		obj.parents('a').before('<div style="position:absolute;top:'+ofs.top+'px;left:'+ofs.left+'px;z-index:99;background-color:maroon;color:white;padding:2px;font-weight:bold;" id="itiz'+id+'">Загрузка...</div>')
	} 
   swapAttr(obj, 'style', 'altstyle')
   swapAttr(obj, 'src', 'altsrc')
   return false;
}

/* */
function apply_isense(a) {
   if(!db.config.intelliSense.v[0]) {
      return
   }
   a.hover(
      function(evt) { // over
	 intelli(
	    evt.pageX+10, 
	    evt.pageY+10, 
	    a.attr('refid'),
	    a.attr('refurl')
	 )
      },
      function(evt) { // out
	 outelli(a.attr('refid'))
      }
   )
}

var z = 0;
var ist = {};

function intelli(x,y,id,url) {
   clearTimeout(ist[id])
	ist[id] = setTimeout(
		function () {
			var obj = $.ui.preview(id,x,y,url,
										  db.config.intelliSense.ajax[0])
			if(obj) {
				apply_me(undefined,obj) 
			} else {
				return
			}
			obj.attr('id','is'+id);
			obj.attr('refid', id);
			apply_isense(obj)
			obj.css('z-index', z++);
			$('body').prepend(obj);
		},
		db.config.intelliSense.raiseup[0])
}

function outelli(id) {
	clearTimeout(ist[id])
   ist[id] = setTimeout(
      function () {
			$('#is'+id).remove()
      }, 
      db.config.intelliSense.fallback[0])
}

function sage(env) {
   if(!env) {
      env = $('body')
   }
   env.email().val('sage')
   if (db.config.sage.inAllFields[0]) { 
      env.user().val('sage')
      env.title().val('sage') 
      db.config.sage.capsBold[0] &&
	 env.postmessage().val('**SAGE**')
   }
}

apply_me = function (env, messages) {
   messages.posts().each(
      function () {
			var obj = $(this)
         var pid = $(this).pid()
			if(db.config.hiding.posts[0]) {
				obj.reflink().after($.ui.controlLink(
					'[|X|]',
					function () { toggle(pid) }
				))
				if(!db.config.hiding.goodStealth[0]) {
					$(this).before($.ui.tizer(
						pid,
						$.ui.controlLink(
							'Пост ' + pid.replace('p','№') + ' ' +
								' скрыт. [|Показать|]',
							function () { toggle(pid) }
						)
						,false))
				}
			}
			/* Censore */
			if(db.config.censore.v[0]) {
				var censf = false;
				/*censf = censf || db.config.censore.username[0] &&
					obj.msgusername().search(db.config.censore.username[0])
				censf = censf || db.config.censore.title[0] &&
					obj.msgtitle().search(db.config.censore.title[0])
				censf = censf || db.config.censore.email[0] &&
					obj.msgemail().search(db.config.censore.email[0])
				censf = censf || db.config.censore.msg[0] &&
					obj.msg().search(db.config.censore.msg[0])
				censf = censf || db.config.censore.total[0] &&
					obj.text().search(db.config.censore.total[0]) */
				if(censf) {
						db.hidden[pid]=1
				}
			}
			if (db.config.forwardReferences.v[0] && $.references[pid]) {
				if(db.config.forwardReferences.asDog[0]) {
					obj.reflink().append('@'+$.references[pid].length)
				} else {
					var refs = [];
					for (j in $.references[pid]) {
						refs.push($.ui.anchor($.references[pid][j]))
					}
					obj.msg().before($.ui.refs(refs.join(', ')+'.'))
				}
			}
      }
   )
   
   db.config.hiding.threads[0] &&
      messages.threads().each(
         function () {
				var subj = $(this)
				var tid = subj.tid()

            $(this).reflink().filter(':first').after($.ui.controlLink(
					'[|Скрыть тред|]',
					function () { toggle(tid) }
				))
            if(!db.config.hiding.goodStealth[0]) {
					if(db.config.hiding.citeLength[0]) {
						var cite = '(' + 
							$(this).msg().text().slice(0, db.config.hiding.citeLength[0] - 1) + 
							'...)'
					} else { var cite = '' }
               $(this).before($.ui.tizer(
						tid,
						$.ui.controlLink(
							'Тред ' + tid.replace('t','№') + ' ' + cite + 
								' скрыт. [|Показать|]',
							function () { toggle(tid) }
						)
						,true))
				}
				var e = $(this).moar()
				if(e) {
					/* Thread unfolding */
					e.append(
						$.ui.controlLink(
							'[|Раскукожить|]',
							function () { unfold(tid) }
						))
					e.clone(true).appendTo($(this).posts().filter(':last'))
					/* Postform */
					/* e.append('[<a href="javascript:toggleReplyForm(\''+tid+'\')">Ответить</a>]') */
				}
         }
      )
   
   db.config.unfoldImages[0] &&
      messages.image().each(
         function () {
            $(this).a().click(
					function () {
						return refold($(this).pid())
					}
				).removeAttr('target')
         }
      ) 
   db.config.intelliSense.v[0] &&
      messages.anchors().each(
         function () { apply_isense($(this)) }
      )
   
   for(var objId in db.hidden) {
      /* It's an low level alternative of toggle method
          * TODO Rewrite toggle for suitable usage in this
          * place (may be impossible). */
      messages.find('#'+objId).css('display','none')
      db.config.goodStealth ||
         messages.find('#tiz'+objId).css('display','block')
   }
	
   if(!env) { /* Board environment setup 
                 no messages processing below this*/
      return
   }

   db.config.sage.button[0] &&
      env.email().after(
			$.ui.controlLink(
				' <b>[</b>|<b>Sage</b>|<b>]</b>',
				function () { sage()	}
			)
		)

   db.config.sage.sageMan[0] &&
      sage(env) 
   
   /* Const password */
   db.config.state.constPasswd[0] &&
      env.passwd().val(db.config.state.constPasswd[0])
   
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

/* */
db.loadCfg(defaults)

$(document).ok(apply_me) 
