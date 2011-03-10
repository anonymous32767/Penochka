on('form:postprocess', function (data) {
   var patterns = [
	  [/---/g, '—'],
	  [/--/g, '–'],
	  [/"(\S)/g, '“$1'],
	  [/(\S)"/g, '$1”'],
	  [/'(\w)/g, '‘$1'],
	  [/(\S)'/g, '$1’'],
	  [/<<(\S)/g, '«$1'],
	  [/(\S)>>/g, '$1»'],
	  ]
   return patterns.reduce(function (res, p) {
	  return res.replace(p[0], p[1])
   }, data)
})