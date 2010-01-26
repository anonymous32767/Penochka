#
## tangle - генератор js-модулей
#
source moduli.tcl

set _oc stdout
set _src [list]
set _raw [list]

proc _gen_header_comment {name title abstract} {
    if ![string compare $title ""] {
	if ![string compare $abstract ""] {
	    return ""
	} {
	    return "/** $abstract */\n"
	}
    } {
	return "/** $name - $title\n\n    $abstract */\n"
    }
}

proc _overture {name title abstract} {
    global _oc _src _raw
	 if [llength $_raw] {
		  puts $_oc [join $_raw "\n\n"]
		  set _raw [list]
	 }
	 if [llength $_src] {
		  puts $_oc [_gen_header_comment $name $title $abstract] nonewline
		  puts $_oc ";(function ($) {\n\t" nonewline
		  puts $_oc [join $_src "\n\t"]
		  puts $_oc "})(jQuery);"
		  puts $_oc ""
		  set _src [list]
	 }
}

proc js { text } {
    global _src
    lappend _src $text
}

proc js* { text } {
    global _src
    lappend _src $text
}

proc raw { text } {
	 global _raw
	 lappend _raw $text
}

proc raw* { text } {
	 global _raw
	 lappend _raw $text
}

proc doc { text } { }
proc bib { acr text } { }