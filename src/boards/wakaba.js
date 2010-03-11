/**
 * @module wakaba
 * @title Слой абстракции от вакабы
 * @descr Специфичные этому движку имиджборды константы и функции.
 * @depends jquery funlib kernel
 */
$.on('wakaba',
     function (data) {
        $.iom = {
           postform: '#postform, div.logo + hr',
           mainmenu: 'div.adminbar:first a:last',
           eot: 'hr:last',
           ref: '>>',
           cache: '#delform',
           css: {
              preview: 'reply',
              highlight: 'highlight',
				  notify: 'reply highlight',
				  unfolded: 'highlight'
           },
           re: {
              ref: /^>>/
           }
        }

        $.extend({
           isThread: location.pathname.match('/res/'),
			  fixHref: function (href) {
				  if (!href.split('#')[1]) {
					  href+='#'+href.match(/(\d+)\D+$/)[1]
				  }
				  return href.replace(/^http:\/\/[\w\.\-]+\//,'/')
			  },
			  aToThreadMenu: function (anc) {
				  return $.nextUntil(
					  function (a) { 
						  return a && a.tagName == 'A' && !a.name
					  }, anc)
			  },
			  aToPostMenu: function (anc) {
				  return $.nextUntil(
					  function (a) { 
						  return a && a.tagName == 'SPAN' && !a.name
					  }, anc)
			  },
			  aToOmitted: function (anc) {
				  var ret = $.nextUntil(
					  function (a) { 
						  return (a && a.tagName == 'SPAN' 
									 && a.className == 'omittedposts' 
									 && !a.name)
							  || (a && a.tagName == 'TABLE')
							  || (a && a.tagName == 'HR')
					  }, anc)
				  if (ret && ret.tagName != 'SPAN') {
					  return null
				  } else { return ret }
			  }
        })

        $.extend($.fn, {
           pst: function () {
              var subj = $(this)
              var ret = subj.closest('table,span.oppost')
              var oppost = null
              if (!ret.length) { /* op post case */
                 subj.parents().andSelf().each(function () {
                    if (!oppost && this.parentNode &&
                        (this.parentNode.tagName == 'FORM' ||
                         (this.parentNode.id && this.parentNode.id.match(/^thread/)))) {
                       oppost = [this]
                    }
                 });

                 if(!oppost) {
                    return ret
                 }

                 up = dn = oppost[0]
                 while (up.nextSibling
                        && up.nextSibling.tagName != 'HR'
								&& up.nextSibling.tagName != 'DIV'
                        && up.nextSibling.tagName != 'TABLE'
                        && !(up.nextSibling.tagName == 'SPAN'
                             && up.nextSibling.className == 'omittedposts')) {
                    up = up.nextSibling
                    oppost.push(up)
                 }

                 while (dn.previousSibling
                        && dn.previousSibling.tagName != 'HR') {
                    dn = dn.previousSibling
                    oppost.unshift(dn)
                 }
                 var span = $('<span class="oppost">')
                 $(up.nextSibling).before(span[0])
                 $(oppost).appendTo(span)
                 return span
              }
              return ret
           },
			  thrd: function() {
				  var subj = $(this)
				  var ret = subj.closest('.thread,div[id^=thread]')
              var titem = null
              if (!ret.length) {
					  subj.parents().andSelf().each(function () {
                    if (!titem && this.parentNode &&
                        this.parentNode.tagName == 'FORM') {
                       titem = [this]
                    }
                 });

                 if(!titem) {
                    return ret
                 }

                 up = dn = titem[0]
                 while (up.nextSibling
                        && up.tagName != 'HR') {
                    up = up.nextSibling
                    titem.push(up)
                 }

                 while (dn.previousSibling
                        && dn.previousSibling.tagName != 'HR') {
                    dn = dn.previousSibling
                    titem.unshift(dn)
                 }
                 var span = $('<span class="thread">')
                 $(up.nextSibling).before(span[0])
                 $(titem).appendTo(span)
                 return span
				  }
				  return ret
			  },
			  preview: function () {
				  var tryTd = $(this).find('td.reply')
				  if (tryTd.length) {
					  return tryTd
				  }
				  return this
			  }
        })
		  return data
     })
