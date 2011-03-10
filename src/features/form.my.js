on('change:attach', function (evt) {
   var file = evt.target.files[0];

   if (!file) {
	  document.getElementById('preview-placeholder').innerHTML = '';
	  return null;
   }

   if (!file.type.match('image.*')) {
      document.getElementById('preview-placeholder').innerHTML = '<div class="no-preview">No preview</div>'
      return null;
   }

   var reader = new FileReader();

   reader.onload = (function(theFile) {
      return function(e) {
         document.getElementById('preview-placeholder').innerHTML =
               ['<img src="', e.target.result, '" />'].join('')
      };
   })(file);

   reader.readAsDataURL(file);

})
