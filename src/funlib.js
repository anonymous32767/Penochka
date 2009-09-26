/**
 * vim: ts=3 sts=3 cindent expandtab
 * funlib - functions library.
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

/** This depends on sizzle css engine (http://sizzlejs.com/) */


var funlib = {
   function a(x) {
      return x instanceof Array ? x : [x]
   }

   function hd(a) { return a[0] }

   Object.prototype.iter =
      function (f, x) {
         var inp = a(this)
         for (var i in inp)
            f(inp[i], x)
      }

   Object.prototype.map =
      function (f, x) {
         var out = []
         var inp = a(this)
         for (var i in inp)
            out.push(f(inp[i], x))
         return out
      }

   Object.prototype.foldl =
      function (f, x) {
         if(x === undefined)
            x = []
         var inp = a(this)
         for (var i in inp)
            x = f(x, inp[i])
         return x
      }

   Object.prototype.find =
      function (x) {
         var _find =
            function (l, e) {
               return l.concat(Sizzle(x, e))
            }
         switch (typeof x) {
         case 'string':
            return this instanceof Array ? this.foldl (_find) : Sizzle(x)
         default:
            return x
         }
      }

   Object.prototype.is =
      function (x) {
         return Sizzle.matches(x, a(this)).length > 0
      }

   Object.prototype.origin =
      function (x) {
         var _origin =
            function (l, e) {
               var p = []
               do {
                  p.push(e)
                  e = e.parentNode
               } while (e)
               return l.concat(Sizzle.filter(x, p))
            }
         return this.foldl (_origin)
      }

   /* TODO: Make this work */
   Object.prototype.swap =
      function (x) {
         var _swap =
            function (a) {
               var r = hd(find(x))
               var t = a.parentNode.insertBefore(document.createTextNode(''), a);
               r.parentNode.insertBefore(a, r);
               t.parentNode.insertBefore(a, t);
               t.parentNode.removeChild(t);
               return a;
            }
         return this.map (_swap)
      }

   Object.prototype.attr =
      function (k, v) {
	 if (v === undefined) {
	    return a(this)[0].getAttribute(k)
	 } else if (v === null) {
	    this.iter(function (e) {
	       e.removeAttribute(k)
	    })
	 } else {
	    this.iter(function (e) {
	       e.setAttribute(k, v)
	    })
	 }
      }
   
   Object.prototype.val =
      function (v) {
	 if (v === undifined) {
	    return a(this)[0].value
	 } else {
	    this.iter(function (e) {
	       e.value = v
	    })
	 }
      }

   Object.prototype.val =
      function (v) {
	 if (v === undifined) {
	    return a(this)[0].value
	 } else {
	    this.iter(function (e) {
	       e.value = v
	    })
	 }
      }

   Object.prototype.hide =
      function () {
	 this.iter(function (e) {
	    e.attr('fl_olddisplay', e.style.display)
	    e.style.display = 'none'
	 })
      }

   Object.prototype.show =
      function () {
	 this.iter(function (e) {
	    var old = e.attr('fl_olddisplay')
	    e.attr('fl_olddisplay', null)
	    e.style.display = old || ''
	 })
      }

   Object.prototype.toggle =
      function () {
	 this.iter(function (e) {
	    e.hasAttribute('fl_olddisplay') ? e.show() : e.hide()
	 })
      }

   Object.prototype.append = function() {
      return this.map(function (e) {
	 if (this.nodeType == 1)
	    this.appendChild(e)
      })
   },
   Object.prototype.prepend =
      function() {
		return this.domManip(arguments, true, function(elem){
			if (this.nodeType == 1)
				this.insertBefore( elem, this.firstChild );
		});
	},

	before: function() {
		return this.domManip(arguments, false, function(elem){
			this.parentNode.insertBefore( elem, this );
		});
	},

	after: function() {
		return this.domManip(arguments, false, function(elem){
			this.parentNode.insertBefore( elem, this.nextSibling );
		});
	},
   
}
