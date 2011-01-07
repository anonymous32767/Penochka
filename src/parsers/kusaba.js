;(function (pnck) {

   function parseThumbInfo(info) {
      var image = {}, link = info.imageInfo.getElementsByTagName('A')[0], m
      if (link) {
         image['url'] = link.href
         image['name'] = link.textContent
      }
      if (m = info.imageInfo.children[info.imageInfo.children.length-1].
          nextSibling.textContent.split(/(\d+)/)) {
         image['size'] = m[1]
         image['w'] = m[3]
         image['h'] = m[5]
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
      var currPost = {}, thumbInfo = {}, currThread = {posts:[]}, cch, threads = board.threads

      var raw = document.querySelectorAll('div.postnode, td.reply, span.omittedposts, hr', root)

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
            threads.push(currThread)
            currThread = {posts:[]}
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
                  currPost['date'] = cch.children[cch.children.length-1].
                        nextSibling.textContent;
                  for (k = 0; k < cch.children.length; k++) {
                     if (cch.children[k].className == 'filetitle'
                         || cch.children[k].className == 'replytitle') {
                        currPost['title'] = cch.children[k].textContent
                     }
                     if (cch.children[k].className == 'postername'
                         || cch.children[k].className == 'commentpostername') {
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
         if (menuLinksRaw[i].getAttribute('href').match(/^\//)) {
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

   on('kusaba', function (document) {
      var board = {}
      board.threads = []
      board.pingbacks = {}
      board.title = document.title.split(/\s+\W\s+/)
      board.menu = parseMenu(document.getElementById('boardlist_header'))
      parseMessages(document.getElementById('delform'), board)
      board.footer = parseFooter(document.getElementsByClassName('footer')[0])
      return board
   })

})(penochka);