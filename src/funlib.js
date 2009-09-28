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

function a (x) { /* Possibly need to inline it */
   return x instanceof Array ? x : [x]
}

function travel (n, f) {
   if (f (n)) {
      if (n.firstChild)
         travel(n.firstChild, f)
      if (n.nextSibling)
         travel(n.nextSibling, f)
   }
}

Node.prototype.swapNode = function (node) {
  var nextSibling = this.nextSibling;
  var parentNode = this.parentNode;
  node.parentNode.replaceChild(this, node);
  parentNode.insertBefore(node, nextSibling);  
}

Object.prototype.iter =
   function (f, x) {
      var inp = a(this)
      for (var i = 0; i < inp.length; i++)
         f(inp[i], x)
   }

Object.prototype.map =
   function (f, x) {
      var out = []
      var inp = a(this)
      for (var i = 0; i < inp.length; i++)
         out.push(f(inp[i], x))
      return out
   }

Object.prototype.foldl =
   function (f, x) {
      if(x === undefined)
         x = []
      var inp = a(this)
      for (var i = 0; i < inp.length; i++)
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
         return a(x)
      }
   }

Object.prototype.make =
   function (x) {
      var out = []
      var e = document.createElement('span')
      e.innerHTML = x
      for(var i = e.firstChild; i; i = i.nextSibling)
	 out.push(i)
      return out
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
      if (v === undefined) {
         return a(this)[0].value
      } else {
         this.iter(function (e) {
            e.value = v
         })
      }
   }

Object.prototype.hide =
   function () {
      return this.map(function (e) {
         e.attr('fl_olddisplay', e.style.display)
         e.style.display = 'none'
	 return e
      })
   }

Object.prototype.show =
   function () {
      return this.map(function (e) {
         var old = e.attr('fl_olddisplay')
         e.attr('fl_olddisplay', null)
         e.style.display = old || ''
	 return e
      })
   }

Object.prototype.toggle =
   function () {
      return this.map(function (e) {
         (e.hasAttribute('fl_olddisplay') || e.style.display == 'none') ? e.show() : e.hide()
	 return e
      })
   }

Object.prototype.append =
   function(x) {
      var y = find(x)
      return y ? this.map(function (e) {
         if (e.nodeType == 1)
	    y.iter(function (z) {
               e.appendChild(z)
	    })
	 return e
      }) : []
   }

Object.prototype.prepend =
   function(x) {
      var y = find(x)
      return y ? this.map(function (e) {
         if (e.nodeType == 1)
	    y.iter(function (z) {
               e.insertBefore(z, e.firstChild)
	    })
	 return e
      }) : []
   }

Object.prototype.before =
   function(x) {
      var y = find(x)
      return this.map(function (e) {
	 y.iter(function (z) {
            e.parentNode.insertBefore(z, e)
	 })
	 return e
      })
   }

Object.prototype.after =
   function(x) {
      var y = find(x)
      return y ? this.map(function (e) {
	 y.iter(function (z) {
            e.parentNode.insertBefore(z, e.nextSibling)
	 })
	 return e
      }) : []
   }

/* FIXME: This should work on arrays! */
Object.prototype.swap =
   function (x) {
      var y = find(x)[0]
      return y ? this.map(function (e) {
	 e.swapNode(y)
	 return e
      }) : []
   }

Object.prototype.remove =
   function (x) {
      if (x === undefined) {
         this.iter(function (e) {
            if (e.parentNode)
               e.parentNode.removeChild (e)
         })
      } else {
         this.find(x).remove()
         return this
      }
   }

Object.prototype.clear =
   function () {
      this.iter(function (e) {
         while(e.hasChildNodes()){
            e.removeChild(e.lastChild);
         }
      })
      return this
   }

Object.prototype.inclass =
   function (x) {
      return this.map(function (e) {
         e.className = (e.className ? ' ' : '') + x
      })
   }

Object.prototype.declass =
   function (x) {
      return this.map(function (e) { 
         e.className = e.className.split(/\s+/).
	    foldl( function (o, c) {
	       if (c != x) 
		  o.push(c)
	       return o
	    }).join(' ')
      })
   }

Object.prototype.css =
   function (ks, v) {
      if (v === undefined) {
         var style = document.createElement( 'style' );
         style.type = 'text/css';
         var head = document.getElementsByTagName('head')[0];
         head.appendChild(style);
         style.appendChild(document.createTextNode(ks));
      } else {
         return this.map(function (e) {
            return e.style[ks] = v
         })
      }
   }

Object.prototype.text =
   function (txt) {
      if (txt === undefined) {
         return this.foldl(function (s, e) {
            travel(e, function (n) {
               if (n.nodeType == 3)
                  s+=n.nodeValue
               if (n.tagName == 'SCRIPT')
                  return false
               return true
            })
            return s
         },'')
      } else {
         return this.clear().map(function (e) {
            return e.append((e && e.ownerDocument || document).createTextNode(txt))
         })
      }
   }

Object.prototype.html =
   function (x) {
      if (x === undefined) {
         return this.innerHTML
      } else {
         this.clear().append(x)
      }
   }

Object.prototype.substitute =
   function (x) {
      return this.map (function (e) {
         return e.after(x).remove()
      })
   }
