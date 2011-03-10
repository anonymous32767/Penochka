;(function (pnck) {

   function prepareFull (subj) {
      return '<img src="' + subj.parentNode.href + '" ' +
            'style="min-width:' + subj.width + 'px;' +
            'min-height:' + subj.height + 'px;" ' +
            'class="image-unfolded"  msg="toggle-image">'
   }

   function toggleFull (subj) {
      var t
      if (!(t = subj.getAttribute('altimg')))
         var t = prepareFull(subj, subj.parentNode.innerHTML)

      subj.removeAttribute('altimg')
      var parent = subj.parentNode, newalt = parent.innerHTML
      parent.innerHTML = t
      parent.children[0].setAttribute('altimg', newalt)
      return null
   }

   on('click:toggle-image', toggleFull)

})();