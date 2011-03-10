;(function (pnck) {

   function units(num, cases) {
      num = Math.abs(num);
      var word = '';
      if (num.toString().indexOf('.') > -1) {
         word = cases.gen;
      } else {
         word = (
            num % 10 == 1 && num % 100 != 11
                  ? cases.nom
                  : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)
                  ? cases.gen
                  : cases.plu
         );
      }

      return word;
   }

   function datetime (dt) {
      var md = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                'июля', 'августа', 'сентября', 'октабря', 'ноября', 'декабря']
	  var minFixed = dt.getMinutes()
      return dt.getDate() + ' ' + md[dt.getMonth()] + ' ' + dt.getFullYear() + ' в ' + 
			dt.getHours() + ':' + (minFixed > 10 ? minFixed : '0' + minFixed)
   }

   on('rtl', function (lib) {
      lib._n = units
      lib._d = datetime
	  return lib
   })

})(penochka);

