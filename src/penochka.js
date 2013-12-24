;(function (ρ) {

   on('init', function (data) {

   	  if(ρ.locked)
   	  	return;

	  ρ.storage('messages').index('post', function (obj) { return obj.id })
	  ρ.storage('messages').index('thread', function (obj) { return obj.id })

	  async_to('render', 'phase1', '.host', '.engine', 'detect-board', {
		 source: document,
		 host: location.host.replace(/^www\./, '')
	  }, null)
   })

   async_on('phase1', function (board, ret) {
	  ρ.board = board
	  board.footer.unshift({
         'name': 'penochka',
         'url': 'http://google.com/',
         'title': 'UnStAbLe'
      })
	  ret(board)
   })

})(penochka);