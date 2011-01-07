#
# Penochka formatter for UserJs (Opera).
#

proc make {js version includes excludes output} {
    set fp [open "$output.js" w]
    puts $fp "/*
 * Penochka imageboard script
 *
 * version: $version
 */"
    append js "\ndocument.addEventListener('DOMContentLoaded', function () { to('init', 1) }, false)\n"
    puts $fp $js
    close $fp
}