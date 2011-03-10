/**
 * Nannou2 - compiling template engine based on
 *           pattern matching.
 *
 * This nannou2 implementation tuned to fit into penochka's signal
 * system. 
 */

;(function (pnck) {

   function trim (x) { return x.replace(/^\s+|\s+$/g, '') }

   sbeg = '<!--/'; send = '-->'

   var nannou2 = function (template, rtl) {
      return eval(template.replace(/;;;.*\n/g,'').split(sbeg).slice(1).map(function (p) {
         var out = p.split(send)
         return [trim(out.shift()), trim(out.join('-->'))]
      }).reduce(function (res, x) {
         return res + ' else if (_.' + x[0].replace(/\s+(\!)?/g, ' && $1_.') + ')'
               + ' { with (_) { return "' + x[1]
               .replace(/[\s\t\n\r]+/g, ' ')
               .replace(/\"/g, '\\"')
               .replace(/\<\?(\s*(\w+)\s*\#)?(.*?)(::(.*?))?\?\>/g,
                        '" + me($3, "$5", "$2") + "')
               + '"}} '
      }, '(function (rtl) {'  +
                'return function me (__, ___, _) {' +
                'function box(v) { var x; return _ ? ((x = ({}))[_] = v, x) : v };' +
                'if (!_ && typeof __ !== "object") return __;' +
                'var x, arr = __.map ? __ : [__];' +
                'return arr.map(box).map(function (_) {' +
                ' if (0) {} ') + '}).join(___ ? ___ : "")}})')(rtl)
   }

   var renderer = null
   
   async_on('render', function (data, ret) {
	  if (!renderer)
		 renderer = nannou2(to('futaba.html'), to('rtl'))
	  ret(to('frontend', renderer(data)))
   })

})(penochka);