/**
 * Nannou2 - compiling template engine based on
 *           pattern matching.
 */

function trim (x) { return x.replace(/^\s+|\s+$/g, '') }

sbeg = '<!--/'; send = '-->'

return function (template) {
   return template.replace(/;;;.*\n/g,'').split(sbeg).slice(1).map(function (p) {
      var out = p.split(send)
      return [trim(out.shift()), trim(out.join('-->'))]
   }).reduce(function (res, x) {
      return res + ' else if (_.' + x[0].replace(/\s+(\!)?/g, ' && $1_.') + ')'
            + ' { with (_) { return "' + x[1]              /***  Обработка шаблона  ***/
            .replace(/[\s\t\n\r]+/g, ' ')                  /* Убираем лишние пробелы  */
            .replace(/\"/g, '\\"')                         /* Экранируем кавычки      */
            .replace(/\<\?((\w+)\#)?(.*?)(::(.*?))?\?\>/g, /* Раскрываем шаблон       */
                     '" + me($3, "$5", "$2") + "')
            + '"}} '
   }, '(function () { ' +                                  /***  Шаблонный рантайм  ***/
             'return function me (__, ___, _) {' +
             'function box(v) { var x; return _ ? ((x = ({}))[_] = v, x) : v };' +
             'if (!_ && typeof __ !== "object") return __;' + /* Если не json то <- себя */
             'var x, arr = __.map ? __ : [__];' +             /* (Array|Object) -> Array */
             'return arr.map(box).map(function (_) {' +
             ' if (0) {} ') + '}).join(___ ? ___ : "")}})()'
}
