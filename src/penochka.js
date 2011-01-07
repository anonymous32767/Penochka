;(function (pnck) {

   var boardInfo = {
	  'www.0chan.ru': {
		 engine: 'kusaba'
	  },
	  'iichan.ru': {
		 engine: 'wakaba'
	  },
	  'www.iichan.ru': {
		 sameas: 'iichan.ru'
	  },
	  '2-ch.ru': {
		 sameas: 'iichan.ru'
	  },
	  'www.2-ch.ru': {
		 sameas: 'iichan.ru'
	  }
   }

   on('init', function (data) {

      var render = eval(pnck.nannou2(to('futaba.html')))
      var board = null
	  var binfo = boardInfo[location.host]
	  while (binfo.sameas) {
		 var origin = binfo.sameas
		 delete binfo.sameas
		 for (i in boardInfo[origin]) {
			binfo[i] = boardInfo[origin][i]
		 }
	  }
	  if(!binfo) {
		 console.log('Unknown location '+location.host+'. Exit.')
		 return 
	  }
      board = to(binfo.engine, document)
      board.css = to('futaba.css')
	  board.footer.unshift({
         'name': 'penochka',
         'url': 'http://google.com/',
         'title': 'UnStAbLe'
      })
      document.documentElement.innerHTML = render(board)
   })
})(penochka);