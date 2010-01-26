#
## weave - генератор документации
#
source moduli.tcl

set _doc [list]
set _bib [list]

proc _header {name title abstract} {
	 return "<!doctype html>
<html>
<head>
  <title>$name \&\#8212; $title</title>
  <link href=\"style.css\" type=\"text/css\" rel=\"stylesheet\" />
</head>
<body>
<h1>$name \&\#8212; $title</h1>
<p class=\"abstract\">$abstract</p>"}

proc _footer {} { return "</body></html>" }

proc _bibstart {} { return "<h2>Bibliography</h2>
<dl>" }

proc _bibend {} { return "</dl>" }

# TODO: Index generation
proc _overture {name title abstract} {
    global _doc _bib
	 set oc [open $name.html w]
	 fconfigure $oc -encoding utf-8
	 if [llength $_doc] {
		  puts $oc [_header $name $title $abstract]
		  puts $oc [join $_doc "\n\n"]
		  puts $oc [_footer]
		  set _doc [list]
	 }
	 if [llength $_bib] {
		  puts $oc [_bibstart]
		  puts $oc [join $_bib "\n"]
		  puts $oc [_bibend]
		  set _bib [list]
	 }
	 close $oc
}

proc _textile { text } {
	 # Partial textile (http://textile.thresholdstate.com/) support

	 regsub -all {\-\-\-} $text {\&#8212;} text
	 regsub -all {\-\-} $text {\&#8211;} text

	 regsub -all {\n=(.*?)\n} $text {\n<center>\1</center>\n} text
	 regsub -all {\s_(.*?)_\s} $text { <em>\1</em> } text
	 regsub -all {\s\*\*(.*?)\*\*\s} $text { <h3>\1</h3> } text
	 regsub -all {\s\*(.*?)\*\s} $text { <strong>\1</strong> } text
	 regsub -all {\s\?\?(.*?)\?\?\s} $text { <blockquote>\1</blockquote> } text
	 regsub -all {\s\-(.*?)\-\s} $text { <s>\1</s> } text
	 regsub -all {\s\+(.*?)\+\s} $text { <u>\1</u> } text
	 regsub -all {\s\^(.*?)\^\s} $text { <sup>\1</sup> } text
	 regsub -all {\s\~(.*?)\~\s} $text { <sub>\1</sub> } text
	 regsub -all {\s\@(.*?)\@\s} $text { <tt>\1</tt> } text

	 regsub -all {\"(.*?)\"\:(\S+)\s} $text {<a href="\2">\1</a> } text
	 regsub -all {\!(.*?)\!\:(\S+)\s} $text {<img src="\2">\1</img> } text

	 regsub -all {(\d\s*)x(\s*\d)} $text {\1\&#215;\2} text

	 # Our small extensions for textile

	 regsub -all {\n\s*\n} $text {</p><p>} text
	 regsub -all {\[(\w+)\]} $text {[<a href=#\1>\1</a>]} text
	 
	 return $text
}

proc js { text } {
    global _doc
    lappend _doc "<p><pre>$text</pre></p>"
}

proc js* { text } {}
proc raw* { text } {}

proc raw { text } {
	 global _doc
	 lappend _doc "<p><pre>$text</pre></p>"
}

proc doc { text } { 
	 global _doc
	 lappend _doc "<p>[_textile $text]</p>"
}

proc bib {acr text} { 
	 global _bib
	 lappend _bib "<dt><sup>\[<a name=\"$acr\">$acr</a>\]</sup><dd>[_textile $text]</li>"
}