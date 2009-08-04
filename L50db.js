/*
 * vim: ts=3 sts=3 cindent expandtab
 * jquery.imgboard - jquery extensions for imageboards.
 *
 * Copyright (c) 2009, anonymous
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are 
 * met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the anonymous nor the names of its contributors 
 *       may be used to endorse or promote products derived from this 
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY anonymous ''AS IS'' AND ANY  EXPRESS OR 
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
 * IN NO EVENT SHALL anonymous BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR 
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var db = {
   config:{
   },
   help: {
      sageMan: {
         desc: 'I\'m a SAGE man'
      },
      capsBold: {
         desc: '<b>CAPSBOLDED</b>'
      },
      inAllFields: {
         desc: 'SAGE goes in all fields'
      },
      hideThreads: {
         desc: 'Threads hiding'
      },
      hidePosts: {
         desc: 'Posts hiding'
      },
      goodStealth: { 
         desc: 'Hide threads & posts carefully'
      },
      unfoldImages: {
      	desc: 'Images unfolding'
      },
      intelliSense: {
      	desc: 'Post previews on anchors hover'
      },
      intelliFallback: {
      	desc: 'Fallback time'
      },
      State: {
         desc: 'Cookies'
      },
      ExpirationTime: {
         desc: 'How many days store hidden objects data'
      }
   },
   hidden: {
   },
   load: 
      function (scheme) {
         try {
	         this.config = $.evalJSON($.cookie('gpenochka'));
            if(!this.config) {
               this.config = scheme
            }
            this.hidden = $.evalJSON($.cookie('penochka')) || {};
         } catch (error) {} 
      },
   saveCfg: 
      function () {
         var getval =
            function (key, vtype) {
               switch (vtype) {
                  case 'boolean':
                     return $('#'+key).attr('checked') ? true : false;
                  break;
                  case 'number':
                  case 'string':
                     return  $('#'+key).attr('value');
                  break;
               }
            }
         var walk_n_save = 
            function (list) {
               for (var key in list) {
                  if(key == 'v') {
                     continue
                  }
                  if (typeof list[key] == 'object') {
                     list[key].v = getval(key, typeof list[key].v)
                     walk_n_save(list[key])
                  } else {
                     list[key] = getval(key, typeof list[key])
                  }
               }
            }
         walk_n_save(db.config);
         $.cookie('gpenochka',$.toJSON(db.config), {path: '/', expires: 9000});
      },

   saveState:
      function () {
         var out = {};
         var t = new Date().getTime()
         var presistentHidden = $('.penThread:visible .penPost:hidden, .penThread:hidden');
         presistentHidden.each(
            function () {
               out[$(this).attr('id')] = t
            }
         )
         for (var i in this.hidden) {
            if (!out[i] && (t - this.hidden[i]) < this.config.State.ExpirationTime*86400 && $('#'+i).is(':hidden')) {
               out[i] = this.hidden[i]
            }
         }
         this.hidden = out;
         $.cookie('penochka',$.toJSON(this.hidden),{expires: 9000});
      },
   __form: "",
   genForm:
      function () {
         var obj = this;
         var genf =
            function (desc, key, val, add) {
            switch (typeof val) {
               case 'boolean':
                  return '<div class="penOpt1">' + desc +
                     '<span class="penOpt2">' +
                        '<input type="checkbox" id="'+key+'" ' + 
                         (val ? 'checked="checked"' : ' ') + '>' +
                     '</span>' +
                     add +
                  '</div>'
               break;
               case 'number':
               case 'string':
                  return '<div class="penOpt1">' + desc +
                     '<span class="penOpt2">' +
                        '<input type="text" id="'+key+'" ' + 
                        'value="' + val + '">' +
                     '</span>' +
                     add +
                  '</div>'
               break;
               case 'undefined':
                  return '<div class="penOpt1">' + desc +
                     '<span class="penOpt2">' +
                     '</span>' +
                     add +
                  '</div>'
            }
         }
         var walk_n_gen =
            function (list) {
               var out = "";
               for (var key in list) {
                  if (key == 'v') {
                     continue
                  }
                  if (typeof list[key] =='object') {
                     out += genf(obj.help[key].desc, key, list[key].v, walk_n_gen(list[key]))
                  } else {
                     out += genf(obj.help[key].desc, key, list[key], '')
                  }
               }
               return out
            }

         if (!this.__form) {
            this.__form = walk_n_gen(this.config);
         } 
         return this.__form
      }
}
