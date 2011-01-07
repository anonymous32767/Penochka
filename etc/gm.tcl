#
# Penochka formatter for Greasemonkey.
#

proc make {js version includes excludes output} {
    set includes "// @include [join $includes "\n// @include "]"
    set excludes "// @exclude [join $excludes "\n// @exclude "]"

    set fp [open "$output.user.js" w]
    puts $fp "// ==UserScript==
// @name           penochka
// @version        $version
// @description    Penochka imgboard script.
$includes
$excludes
// @run-at         document-start
// ==/UserScript=="
    regsub -all {innerText} $js {textContent} js
    append js "\nto('init', 1)\n"
    puts $fp $js
    close $fp
}