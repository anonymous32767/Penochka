#
# Penochka formatter for Greasemonkey.
#

proc make {js version includes excludes output} {
   set includes "// @include [join $includes "\n// @include "]"
   set excludes "// @exclude [join $excludes "\n// @exclude "]"

   set fp [open "$output.user.js" w]
   fconfigure $fp -encoding utf-8
   puts $fp "// ==UserScript==
// @name           Govno 3 aka penochka
// @version        $version
// @description    Penochka imgboard script.
$includes
$excludes
// @run-at         document-start
// ==/UserScript==

var Pnchk = null;"
	regsub -all {innerText} $js {textContent} js 
   puts $fp $js
   close $fp
}