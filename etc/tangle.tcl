proc js {text} {
	global curr
	dict set curr src "[dict get $curr src]$text"
}

proc doc {text} {}