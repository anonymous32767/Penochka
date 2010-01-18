#
## tangle - генератор js-модулей на js
#
source moduli.tcl

set oc stdout
set src [list]

proc gen_header_comment {name title abstract} {
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

proc overture {name title abstract} {
    global oc src
    puts $oc [gen_header_comment $name $title $abstract] nonewline
    puts $oc ";(function () {"
    puts $oc [join $src "\n"]
    puts $oc "})();"
    puts $oc ""
    set src [list]
}

proc js { text } {
    global src
    lappend src $text
}

proc js* { text } {
    global src
    lappend src $text
}

proc doc { text } { }