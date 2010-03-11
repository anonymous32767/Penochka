/**
 * @module wakaba-iter
 * @title Итератор по ссылкам вакабы
 * @descr Специфичные этому движку имиджборды константы и функции.
 * @depends kernel
 */
$.on(
   'wakaba',
   function (data) {
      $.on(
         'domready',
         function (data) {
            /* Обратноходовый движок обхода дома.
               Содержит много некрасивого кода для того,
               чтобы работало быстрее.

               Без особой необходимости лучше не лезть в
               этот цикл. */
            var a = data.e.getElementsByTagName('A')
            for (var i = a.length - 1; i >= 0; i--) {
               if (a[i].name) {
                  $.to('post', {e:a[i], id:a[i].name, op: a[i].parentNode.tagName != 'TD'})
               } else if (a[i].onclick) {
                  $.to('ref', {e:a[i]})
               }
            }
            return data
         })

      return data
   })