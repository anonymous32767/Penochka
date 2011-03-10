(function (ρ) {

   var posts_by_id = {}

   function wakamark(text, postnum) {
      /* see wakautils.pl */
      return ('<p>'+('\n'+text+'\n').
              replace(/[\r\n]\s*[\r\n]/g, '\n').
              replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').
              replace(/\*(.*?)\*/g, '<em>$1</em>').
              replace(/(http|https|wave|ftp|mailto|gopher):(\S+)/g, '<a href="$1:$2">$1:$2</a>').
              replace(/\%\%(.*?)\%\%/g, '<span class="spoiler">$1</span>').
              replace(/>>(\/?(\w+)\/)?(\d+)/g, function (_, __, board, post) {
                 return '<a href="http://'+location.host+'/'+(board || location.pathname.split('/')[1])+'/res/00.xhtml#'+post+'">&gt;&gt;' + (board ? '/'+board+'/' : '') + post + '</a>'
              }).
              replace(/[\r\n](>.*?)[\r\n]/g,'\n<blockquote class="unkfunc">$1</blockquote>\n').
              replace(/[\r\n]/g, '</p><p>')
              +'</p>').replace(/<p>\s*<\/p>/g, '')
   }

   function truncateFn(fname) {
      var parts = fname.split('.'), name = parts.slice(0, parts.length-1).join(''), ext = parts.slice(parts.length-1).join('')
      if (name.length > 11) {
         return name.slice(0,9)+'~.'+ext
      }
      return fname
   }

   function hackHanabiraJson(board, bname) {

      board.threads.map(function (thread) {
         thread.omitted = {posts: thread.posts_count - thread.posts.length, attaches: 0}
         thread.menu = [{
            url: '/'+bname+'/res/'+thread.posts[0].display_id+'.xhtml',
            title: '',
            name:'Посетить тред'
         }]
         thread.posts.map(function (post) {
            post.id = post.display_id
			posts_by_id[post.id] = post
            post.reflink = '/'+bname+'/res/'+thread.posts[0].display_id+'.xhtml#'+post.display_id
            post.author = post.name
            post.email = post.email || ''
            post.date = new Date(post.date)
            post.title = post.subject
            post.message = to(
               'message-text',
               {message: wakamark(post.message),
                board: board,
                post: post }).message
            post.attaches = post.files.map(function (file) {
               return {
                  h: file.metadata.height || '?',
                  w: file.metadata.width || '?',
                  url: '/'+file.src,
                  size: Math.floor(file.size / 1024),
                  name: truncateFn(file.src.replace(/^.*\//, '')),
                  thumb: {
                     thumb: true,
                     url: '/'+file.thumb,
                     h: file.thumb_height,
                     w: file.thumb_width
                  }
               }
            })
         })
      })
	  board.threads.map(function (thread) {
         thread.posts.map(function (post) {
            if (!board.pingbacks[post.id]) {
               board.pingbacks[post.id] = []
            }
            post.pingbacks = board.pingbacks[post.id]
		 })
	  })
      return board
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

   async_on('hanabira_json', function (data, ret) {
	  var bname = ''
      for (bname in data.json.boards) 
         data.board.threads = data.json.boards[bname].threads
	  
      ret(hackHanabiraJson(data.board, bname))
   })

   async_on('hanabira', function (board, ret) {

      board.pingbacks = {}
      board.title = document.title.split(/\s+\W\s+/)
      board.menu = parseMenu(document.getElementsByClassName('adminbar')[0])
      board.footer = parseFooter(document.getElementsByClassName('footer')[0])
	  if (document.getElementById('trcaptcha').textContent.replace(/[\s\r\n]/g,'') !== '')
		 board.form.noCaptcha = true
      async_to('hanabira_json', 'ajaj',
               {board: board, href: location.pathname.replace(/xhtml$/, 'json')}, 
			   ret)

   })

})(penochka);