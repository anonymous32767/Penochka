#
# Penochka formatter for IE Greasemonkey.
#

proc make {js name description version includes excludes output} {
   set includes "// @include [join $includes "\n// @include "]"
   set excludes "// @exclude [join $excludes "\n// @exclude "]"

   set fp [open $output.user.js w]
   fconfigure $fp -encoding utf-8
   puts $fp "// ==UserScript==
// @name           $name
// @version        $version
// @description    $description
$includes
$excludes
// @run-at         document-start
// ==/UserScript==

var Pnchk = null;"
   puts $fp $js
   close $fp
}