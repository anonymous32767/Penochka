/**
 * Wakaba-like reflinks processing 
 */
on('message-text', function (data) {
   var  board = data.board, currPost = data.post
   data.message = data.message.replace(/<a\s+href="([^"]*?)(\/\w+\/)res\/(\d+)\.html(#(\d+))?".*?\/a>/g, function (_, h, b, thread, __, post) {
      var dispBoard = b, dispHost = h, url = h+b+'res/'+thread+'.html' + (post && ('#' + post) || '')
      post = post || thread
      if (!h || h.match(location.host)) {
         dispHost = ''
      } else {
         dispHost = dispHost.replace(/^.*?([\w-]+\.\w+)$/, '/$1')
      }
      if (location.pathname.match(b) && !dispHost) {
         dispBoard = ''
      }
      if (!board.pingbacks[post])
         board.pingbacks[post] = []
      board.pingbacks[post].push({host:dispHost, board: dispBoard, post:currPost.id, url: url})
      return '<a href="'+url+'">&gt;&gt;'+dispHost+dispBoard+post+'</a>'
   })
   return data
})