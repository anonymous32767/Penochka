#
## js2web converts jsdoc to jweb format.
#

proc parse {jsdoc} {

   proc wsplit {str sep} {
      split [string map [list $sep \0] $str] \0
   }

   proc parse_jsdoc {jsdoc} {
      regsub -all {\n\s*\*} $jsdoc "\n" jsdoc
      regsub -all "\\n\\s*@(\\w+)\\s*\{" $jsdoc "\}\n\\1 \{" jsdoc
      regsub -all {\n\s*@(\w+)\s*} $jsdoc "\}\n\\1 \{" jsdoc
      regsub -all {\s*\n[\s\t]*\n\s*} $jsdoc "\}\n\n\doc \{" jsdoc
      return "doc \{[string trim $jsdoc]\}\n"
   }

   set out ""
   foreach tuple [wsplit $jsdoc {/**}] {
      set jd [wsplit $tuple {*/}]
		set doc [lindex $jd 0]
		set js [join [lrange $jd 1 end] {*/}]
      set out "$out[parse_jsdoc $doc]\njs {$js}\n"
   }

   return $out
}