;(function (ρ) {

   on('mouseover:reflink', function (subj) {
      console.log(subj)
      var address = subj.target.href;
      var hash = address.split('#')[1];
      var a = document.getElementsByName(hash)[0];
      if (!a) {
         to('/r/ cache', {href:address, cookie:'isense', x:subj.pageX, y:subj.pageY})   
      } else {
         to('message ok', {href:address, cookie:'isense', x:subj.pageX, y:subj.pageY, preview:a.parentNode})
      }     
   })

   on('cache ok', function (data) {
      if (data.cookie != 'isense')
         return;

      data.preview = data.data.getElementsByName(data.href.split('#')[1]).parentNode;
      to('message ok', data)
   })

   on('message ok', function (data) {
      if (data.cookie != 'isense')
         return;

      console.log(data)
      var preview = document.createElement('DIV')
      preview.innerHTML = data.preview.innerHTML
      preview.setAttribute('style', 'position:absolute; top:' 
      	+ data.y + 'px; left:' 
      	+ data.x + 'px; max-width: ' 
      	+ (document.body.clientWidth - data.x - 10) + 'px')
      preview.setAttribute('msg', 'preview')
      preview.setAttribute('class', 'preview')
      document.documentElement.appendChild(preview)
   })

   on('mouseout:preview', function (subj) {
      var preview = subj.target;
      preview.parentNode.removeChild(preview);
   })

})(penochka);