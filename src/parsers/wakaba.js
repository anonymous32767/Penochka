(function (ρ) {

   function parseThumbInfo(info) {
      var image = {}, link = info.imageInfo.getElementsByTagName('A')[0], m
      if (link) {
         image['url'] = link.href
         image['name'] = link.textContent
      }
	  m = info.imageInfo.textContent.split(/(\d+)/)
      if (m && m.length > 3) {
         image['size'] = m[3]
         image['w'] = m[5]
         image['h'] = m[7]
      } else {
		 image['size'] = '?'
         image['w'] = '?'
         image['h'] = '?'
	  }
      if (info.thumbInfo && (thumb = info.thumbInfo.getElementsByTagName('IMG')[0])) {
         image['thumb'] = {
            'thumb': true,
            'url': thumb.src,
            'w':thumb.width,
            'h':thumb.height
         }
      }
      return image
   }

   function parseMessages(root, board) {
      var stack  = [], i
      var currPost = {}, thumbInfo = {}, currThread = {posts:[], omitted:{}}, cch, threads = board.threads

      function finState(postOnly) {
         if (currPost.id) {
            currThread.posts.push(currPost)
            if (!board.pingbacks[currPost.id]) {
               board.pingbacks[currPost.id] = []
            }
            currPost.pingbacks = board.pingbacks[currPost.id]
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

      i = 0

      while (true) {
         while (i < root.children.length) {
            cch = root.children[i]
            i++
            if (cch.tagName == 'A' && (cch.id || cch.name)) {
               currPost.id = cch.id || cch.name
            }
            if (cch.tagName == 'SPAN' &&
                (cch.className == 'filetitle'
                 || cch.className == 'replytitle')) {
               currPost['title'] = cch.innerText
            }
            if (cch.className == 'postername'
                || cch.className == 'commentpostername') {
			   currPost['email'] = cch.children[0] ? cch.children[0].href : ''
               currPost['author'] = cch.innerText
            }
            if (cch.tagName == 'SPAN' && (cch.className == 'reflink')) {
               link = (cch.getElementsByTagName('A') || [])[0]
               if (link)
                  currPost['reflink'] = link.href
               sticky = (cch.getElementsByTagName('IMG') || [])[0]
               if (sticky && sticky.src.match('sticky')) {
                  if (!currPost['perks'])
                     currPost['perks'] = []
                  currPost['perks'].push({perk:'<span class="forced">frcd</span>'})
               }
            }
            if ((cch.tagName == 'SPAN' && (cch.className == 'adm' || cch.className == 'mod'))
                || (cch.tagName == 'FONT' && cch.parentNode && cch.parentNode.tagName == 'LABEL')) {
               if (!currPost['perks'])
                  currPost['perks'] = []
               currPost['perks'].push({perk:cch.textContent})
            }
            if (cch.tagName == 'LABEL') {
               currPost['date'] = ''
			   cch.children[cch.children.length-1].
                     nextSibling.textContent.replace(
                              /(\d{2})\s(\S+)\s(\d{4})\s(\d{2}):(\d{2}):(\d{2})/,
                        function (_, day, mstr, year, h, m, s) {
                           var md = {'янв':0, 'фев':1, 'мар':2, 'апр':3, 'май':4, 'июн':5,
                                     'июл':5, 'авг':7, 'сен':8, 'окт':9, 'ноя':10, 'дек':11,
									 'января':0, 'февраля':1, 'марта':2, 'апреля':3, 'мая':4, 'июня':5, 
									 'июля':6, 'августа':7, 'сентября':8, 'октября':9, 'ноября':10, 'декабря':11 }
                           currPost['date'] = new Date(year, md[mstr.toLowerCase()], day, h, m, s)
                        })
               stack.push([root, i, function () {}])
               i = 0
               root = cch
            }
            if (cch.tagName == 'BLOCKQUOTE') {
               var processed = to(
                  'message-text',
                  {message: cch.innerHTML.
                   replace(/<div\s+class="abbrev".*?\/div>/,
                           function () {
                              currPost.cutted = true
                              return ''
                           }),
                   board: board,
                   post:currPost })
               currPost['message'] = processed.message
            }
            if (cch.className == 'filesize') {
               var cch_n = cch;
               while (cch_n && !(cch_n.tagName == 'A' || (cch_n.tagName == 'SPAN' && cch_n.id)))
                  cch_n = cch_n.nextElementSibling
               if (!currPost['attaches'])
                  currPost['attaches'] = []
               currPost['attaches'].push(parseThumbInfo({
                  imageInfo: cch,
                  thumbInfo: cch_n
               }))
            }
            if (cch.tagName == 'DIV' && cch.children[0] && cch.children[0].tagName == 'OBJECT') {
               if (!currPost['attaches'])
                  currPost['attaches'] = []
               currPost['attaches'].push({video: cch.innerHTML})
            }
            if (cch.tagName == 'SPAN' && cch.className == 'omittedposts') {
               m = cch.innerText.split(/(\d+)/)
               currThread['omitted'] = {posts: m[1] || 0, attaches: m[3] || 0}
            }
            if (cch.tagName == 'TABLE') {
               finState(true)
               answ = cch.getElementsByClassName('reply')[0]
               if (answ) {
                  stack.push([root, i, function () {  finState(true) }])
                  i = 0
                  root = cch.getElementsByClassName('reply')[0]
               }
            }
            if (cch.tagName == 'DIV' && cch.id && cch.id.match(/^t/)) {
               stack.push([root, i, function () { }])
               i = 0
               root = cch
            }
            if (cch.tagName == 'HR') {
               finState(false)
            }
         }

         if (stack.length > 0) {
            ps = stack.pop()
            root = ps[0]; i = ps[1]; ps[2]()
         } else {
            finState(false)
            break
         }

      }
      return threads
   }

   function parseMenu(root) {
      var menuLinks = []
      var menuLinksRaw = root.getElementsByTagName('A'), i
      for (i = 0; i < menuLinksRaw.length; i++) {
         if (menuLinksRaw[i].href.match(/\/\w+\//)) {
            menuLinks.push({
               'name': menuLinksRaw[i].textContent,
               'url': menuLinksRaw[i].href,
               'title': menuLinksRaw[i].title || ''
            })
         }
      }
      return menuLinks
   }

   function parseFooter(root) {
      var out = [], i
      if (!root)
         return out
      var footerLinksRaw = root.getElementsByTagName('A'), i
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

   async_on('wakaba', function (board, ret) {
	   var document = board.source
      board.threads = []
      board.pingbacks = {}
      board.title = document.title.split(/\s+\W\s+/)
      board.menu = parseMenu(document.querySelector(board.wakaba.adminbar))
      parseMessages(document.querySelector(board.wakaba.delform), board)
      board.footer = parseFooter(document.getElementsByClassName('footer')[0])
      ret(board)
   })

})(penochka);