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
      document.documentElement.innerHTML = render(
		 to('bomready', 
			{board: to(binfo.engine, document)}).board
	  )
   })

   on('bomready', function (data) {
	  data.board.footer.unshift({
         'name': 'penochka',
         'url': 'http://google.com/',
         'title': 'UnStAbLe'
      })
	  return data
   })

})(penochka);