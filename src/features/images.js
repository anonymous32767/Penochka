/**
 * @module images
 * @title  Раскрытие изображений
 * @descr  Развертка изображений которые обернуты ссылками, ведущими на
 * оригиналы
 * @depends jquery kernel evproxy
 *
 * Задача развертки изображения разбивается на две подзадачи: (а)
 * определить, что изображение, по которому кликнул пользователь, может
 * быть развернуто и (б) собрать информацию, необходимую для
 * развертывания и развернуть.
 *
 * Первая задача решается в обработчике события функцией
 * testThumb(elt) .
 */
function testThumb (subj) {
   return subj.is('img')
      && ({jpeg:1,jpg:1,png:1,gif:1,tiff:1,bmp:1})
   [subj.closest('a').attr('href').
    replace(/^.*\.(\w+)$/,'$1').toLowerCase()]
}

function prepareFull (subj) {
   return '<img src="' + subj.parent().attr('href') + '" ' +
      'style="min-width:' + subj.attr('width') + 'px;' +
      'min-height:' + subj.attr('height') + 'px;" ' +
      'class="'+$.iom.css.unfolded+'" >'
}

function toggleFull (subj) {
   if (!subj.attr('altimg'))
      var t = prepareFull(subj)
   else
      var t = subj.attr('altimg')

   subj.removeAttr('altimg')
   var alt = $(t).attr('altimg', subj.parent().html())
   subj.replaceWith(alt)
}

$.on(
   'click',
   function (data) {
      var subj = $(data.e)
      if (data.event.which == 1 && testThumb(subj)) {
         toggleFull(subj)
         return null
      } else {
         return data
      }
   })
