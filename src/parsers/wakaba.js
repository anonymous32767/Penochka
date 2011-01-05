function parseThumbInfo(info) {
   var image = {}
   image['url'] = info.imageInfo.getElementsByTagName('A')[0].href
   m = info.imageInfo.getElementsByTagName('EM')[0].textContent.split(/(\d+)/)
   if (m) {
      image['size'] = m[1]
      image['w'] = m[3]
      image['h'] = m[5]
   }
   thumb = info.thumbInfo.getElementsByTagName('IMG')[0]
   image['thumb'] = {
      'url': thumb.src,
      'w':thumb.width,
      'h':thumb.height
   }
   return image
}

function parseMessages(root) {
   var stack  = [], i
   var currPost = {}, thumbInfo = {}, currThread = {posts:[]}, cch, threads = []

   function finState(postOnly) {
      if (currPost.id) {
         currThread.posts.push(currPost)
         currPost = {}
      }
      if (!postOnly && currThread.posts.length > 0) {
         threads.push(currThread)
         currThread = {posts:[]}
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
         if (cch.tagName == 'SPAN' && cch.className == 'postername') {
            currPost['author'] = cch.innerText
         }
         if (cch.tagName == 'LABEL') {
            currPost['date'] = cch.children[cch.children.length-1].
                  nextSibling.textContent
            stack.push([root, i, function () {}])
            i = 0
            root = cch
         }
         if (cch.tagName == 'BLOCKQUOTE') {
            currPost['message'] = cch.innerHTML
         }

         if (cch.tagName == 'SPAN' && cch.className == 'filesize') {
            thumbInfo['imageInfo'] = cch
         }
         if (cch.tagName == 'SPAN' & cch.className == 'thumbnailmsg') {
            thumbInfo['thumbInfo'] = cch.nextElementSibling.
                  nextElementSibling
         }
         /* ^^ */ if (thumbInfo['imageInfo'] && thumbInfo['thumbInfo']) {
            currPost['attach'] = parseThumbInfo(thumbInfo)
            thumbInfo = {}
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
         if (cch.tagName == 'DIV' && cch.id && cch.id.match(/^thread/)) {
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
      if (menuLinksRaw[i].getAttribute('href').match(/^\//)) {
         menuLinks.push({
            'name': menuLinksRaw[i].textContent,
            'url': menuLinksRaw[i].href,
            'title': menuLinksRaw[i].title || ''
         })
      }
   }
   return menuLinks
}

return function parse(document) {
   return {
      'title': document.title.split(/\s+—\s+/),
      'menu': parseMenu(
         document.getElementsByClassName('adminbar')[0]),
      'threads': parseMessages(document.getElementById('delform')),
      'footer': document.getElementsByClassName('footer')[0].innerHTML
   }
}