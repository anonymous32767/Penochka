;(function (pnck) {

   function trim (x) { return x.replace(/^\s+|\s+$/g, '') }

   function ml_parse(text) {
	  var out = {}
	  out.message = ('\n'+text).replace(/\n\.\.(.*)\n/g, function (_, modeline) {
		 var kv_raw = modeline.split(/:(\w+)/)
		 if (kv_raw.length>1) {
			kv_raw.pop()
			while (kv_raw.length > 0) {
			   var k = kv_raw.pop(), v = kv_raw.pop()
			   out[trim(k)] = trim(v)
			}
		 }
		 return '\n'
	  })
	  return out
   }

   function ml_print(obj) {
	  var text = obj.message, modeline = '', k
	  delete obj.message
	  for (k in obj) {
		 modeline += obj[k] + ' :' + k + ' '
	  }
	  return (modeline ? '.. ' + modeline : '') + text
   }

   var postProcess = null

   on('click:post', function (obj) {
	  var postform = document.getElementById('postform')
	  var textarea = document.getElementById('postmsg') 
	  var message = ml_parse(to('form:postprocess', textarea.value))
	  if (postProcess)
		 postProcess(postform.getElementsByTagName('FORM')[0], message)
	  return obj
   })

   on('click:postnum', function (elt) {
	  var thread_starter = document.getElementById('thread-starter')
	  var postform = document.getElementById('postform')
	  var textarea = document.getElementById('postmsg') 
	  var message = ml_parse(textarea.value)

	  var re_num = elt.getAttribute('num') || elt.innerText

	  if (re_num) {
		 var selection = '' + getSelection()
		 message.message += '\n>>'+re_num + (selection ? ('\n' + selection).replace('\n', '\n> ') : '')
	  }

	  var thr_wrap = elt
	  
	  delete message.parent

	  while (thr_wrap && thr_wrap.getAttribute && !thr_wrap.getAttribute('thread_id'))
		 thr_wrap = thr_wrap.parentNode
	  
	  if (thr_wrap && thr_wrap.getAttribute && thr_wrap.getAttribute('thread_id')) 
		 message.parent = thr_wrap.getAttribute('thread_id')

	  while (elt && elt.className != 'postwrap')
		 elt = elt.parentNode

	  elt.parentNode.insertBefore(
		 postform,
		 elt.nextSibling)

	  textarea.value = to('form:postprocess', ml_print(message))

	  textarea.focus()
	  textarea.setSelectionRange(9000, 9000); // Seems being enough

	  thread_starter.setAttribute('style', elt == thread_starter ? 'display:none' : '')

	  return null
   })

   async_on('phase1', function (board, ret) {
	  postProcess = board.form.postProcess
	  board.form.hidden = true
	  ret(board)
   })
})(penochka);