on('bomready', function (data) {
   data.board.menu.sort(function (a, b) { return a.name.localeCompare(b.name) })
   return data
})