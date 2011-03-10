#
# Penochka formatter for Opera extension.
#
# Requires 7zip installed.
#
# @http://dev.opera.com/articles/view/hands-on-building-an-opera-extension/
#

proc make {js version includes excludes output} {
    set includes "// @include [join $includes "\n// @include "]"
    set excludes "// @exclude [join $excludes "\n// @exclude "]"

    set fp [open "config.xml" w]
	puts $fp "<?xml version=\"1.0\" encoding=\"utf-8\"?>
<widget xmlns=\"http://www.w3.org/ns/widgets\">
   <name>Penochka</name>
   <description>Penochka imageboard script.</description>
   <author href=\"wave:rmstallman@microsoft.com\">Anonymous 32767</author>
   <icon src=\"etc/icon48.png\"/>
</widget>"
    close $fp

    set fp [open "index.html" w]
	puts $fp "<!doctype html>"
    close $fp

    set fp [open "$output.js" w]
    puts $fp "// ==Penochka==
$includes
$excludes"
    puts $fp $js
	puts $fp "\ndocument.addEventListener('DOMContentLoaded', function () { to('init') });\n"
    close $fp



    exec 7z a $output.oex -tzip -mx=9 config.xml index.html etc\\icon48.png "$output.js"

    # Delete temporary files
    file delete "$output.js"
    file delete config.xml
    file delete index.html
}