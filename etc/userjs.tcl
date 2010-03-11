#
# Penochka formatter for UserJs (Opera).
#

proc make {js version includes excludes output} {
   set fp [open "$output.js" w]
	fconfigure $fp -encoding utf-8
   puts $fp "var Pnchk = null;"
   puts $fp $js
   close $fp
}