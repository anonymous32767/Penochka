;(function (ρ) {

   function parseThumbInfo(info) {
      var image = {}, link = info.imageInfo.getElementsByTagName('A')[0], m
      if (link) {
         image['url'] = link.href
         image['name'] = link.textContent
      }
	  m = info.imageInfo.textContent.split(/(\d+)/)
      if (m && m.length > 3) {
         image['size'] = m[3]
         image['w'] = m[7]
         image['h'] = m[9]
      } else {
		 image['size'] = '?'
         image['w'] = '?'
         image['h'] = '?'
	  }
      if (thumb = info.thumbInfo.getElementsByTagName('IMG')[0]) {
         image['thumb'] = {
            'thumb': true,
            'url': thumb.src,
            'w':thumb.width,
            'h':thumb.height
         }
      }
      return image
   }

   function parseMessages (root, board) {
      var stack  = [], i, j, k
      var currPost = {}, thumbInfo = {}, currThread = {posts:[], omitted:{}}, cch, threads = board.threads

      var raw = document.querySelectorAll('div.postnode, td.reply, span.omittedposts, hr', root)

      function finState(postOnly) {
         if (currPost.id) {
            currThread.posts.push(currPost)
            if (!board.pingbacks[currPost.id]) {
               board.pingbacks[currPost.id] = []
            }
            currPost.pingbacks = board.pingbacks[currPost.id]
			currPost.parent = currThread.posts[0].id
			ρ.storage('messages').save(currPost)
            currPost = {}
         }
         if (!postOnly && currThread.posts.length > 0) {
			currThread.menu = {
			   url: currThread.posts[0].reflink.replace(/#.*?$/,''), 
			   title: '',
			   name:'Посетить тред'
			}
            threads.push(currThread)
            currThread = {posts:[], omitted:{}}
         }
      }

      for (var i = 0; i < raw.length; i++) {
         if (raw[i].className == 'omittedposts') {
            m = raw[i].textContent.split(/(\d+)/)
            currThread['omitted'] = {posts: m[1] || 0, attaches: m[3] || 0}
         } else if (raw[i].className == 'postnode' || raw[i].className == 'reply') {
            for (j = 0; j < raw[i].children.length; j++) {
               var cch = raw[i].children[j]
               if (cch.tagName == 'A' && cch.name && cch.name.match(/^\d+$/)) {
                  currPost.id = cch.name
               }
               if (cch.className == 'filesize') {
                  currPost['attaches'] = parseThumbInfo({
                     imageInfo: cch,
                     thumbInfo: cch.nextElementSibling.
                           nextElementSibling
                  });
               }
               if (cch.tagName == 'LABEL') {
				  currPost['title'] = ''
				  currPost['author'] = ''
				  currPost['date'] = ''
				  cch.children[cch.children.length-1].
                        nextSibling.textContent.replace(
								 /(\d{4})\s(\S{3})\s(\d{2})\s(\d{2}):(\d{2}):(\d{2})/, 
						   function (_, year, mstr, day, h, m, s) {
                           var md = {'янв':0, 'фев':1, 'мар':2, 'апр':3, 'май':4, 'июн':5,
                                     'июл':5, 'авг':7, 'сен':8, 'окт':9, 'ноя':10, 'дек':11,
									 'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 
									 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11 }
							  currPost['date'] = new Date(year, md[mstr.toLowerCase()], day, h, m, s)
						   })
                  for (k = 0; k < cch.children.length; k++) {
                     if (cch.children[k].className == 'filetitle'
                         || cch.children[k].className == 'replytitle') {
                        currPost['title'] = cch.children[k].textContent
                     }
                     if (cch.children[k].className == 'postername'
                         || cch.children[k].className == 'commentpostername') {
						currPost['email'] = cch.children[k].children[0] ? cch.children[k].children[0].href : ''
                        currPost['author'] = cch.children[k].textContent
                     }
                  }
               }
               if (cch.className == 'reflink') {
                  currPost['reflink'] = cch.children[0].href
               }
               if (cch.tagName == 'BLOCKQUOTE') {
                  var processed = to(
                     'message-text',
                     {message: cch.getElementsByClassName('postmessage')[0].innerHTML.
                      replace(/<div\s+class="abbrev".*?\/div>/,
                              function () {
                                 currPost.cutted = true
                                 return ''
                              }),
                      board: board,
                      post:currPost })
                  currPost['message'] = processed.message
               }
            }
            finState(true)
         } else if (raw[i].tagName == 'HR') {
            finState(false)
         } else {
            console.log('Strange node: '+ raw[i])
         }
      }

      return threads
   }

   function parseMenu(root) {
      var menuLinks = []
      var menuLinksRaw = root.getElementsByTagName('A'), i
      for (i = 0; i < menuLinksRaw.length; i++) {
         if (menuLinksRaw[i].getAttribute('href').match(/\/\w+\//)) {
            menuLinks.push({
               'name': menuLinksRaw[i].href.replace(/^.*\/(\w+).*?$/, '$1'),
               'url': menuLinksRaw[i].href,
               'title': menuLinksRaw[i].title || ''
            })
         }
      }
      return menuLinks
   }

   function parseFooter(root) {
      var out = [{name: 'kuasba', url: 'http://google.com', title: ''}], i
      if (!root)
         return out
      var footerLinksRaw = root.getElementsByTagName('A')
      if (!footerLinksRaw)
         return out
      for (i = 0; i < footerLinksRaw.length; i++) {
         out.push({
            'name': footerLinksRaw[i].textContent,
            'url': footerLinksRaw[i].href,
            'title': footerLinksRaw[i].title || ''
         })
      }
      return out
   }

   async_on('kusaba', function (board, ret) {
	  var document = board.source, m
      board.threads = []
      board.pingbacks = {}
	  if (m = location.pathname.match(/(\d+)\.\w+$/)) {
		 board.parent = m[1]
		 board.form.messageData = '.. ' + m[1] + ' :parent \n'
	  }
      board.title = document.title.split(/\s+\W\s+/)
      board.menu = parseMenu(document.getElementById('boardlist_header'))
      parseMessages(document.getElementById('delform'), board)
      board.footer = parseFooter(document.getElementsByClassName('footer')[0])
      ret(board)
   })

})(penochka);