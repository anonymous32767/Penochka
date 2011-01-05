var nannou2 = use('nannou'), parse = use('wakaba/parser')

var template = load('futaba.html')

var render = eval(nannou2(template))
var board = null

on('domready', function () {
   parse(document)
   document.documentElement.innerHTML = render(board)
})