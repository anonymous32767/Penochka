set curr [dict create]
set modules [dict create]

proc module {name} {
	global curr
	set curr [dict create name $name src "" doc ""]
}

proc title {text} {
	global curr
	dict append curr title $text
}

proc descr {text} {
	global curr
	dict append curr descr $text
}

proc depends {deps} {
	global curr
	dict append curr deps [regexp -all -inline {\S+} $deps]
}

proc loadcached {filename} {
	global curr modules
	set fp [open $filename r]
	fconfigure $fp -encoding utf-8
	eval [read $fp]
	dict append modules [dict get $curr name] $curr
	close $fp
}

proc load {filename} {
	global curr modules
	set fp [open $filename r]
	fconfigure $fp -encoding utf-8
	eval [parse [read $fp]]
	dict append modules [dict get $curr name] $curr
	close $fp
}

set mknown [dict create]

proc compile {mods} {
	global mknown

	proc include {mlist} {
		global modules mknown
		set out ""
		set errs [list]
		foreach m $mlist {
			if [catch {set cur [dict get $modules $m]} err] {
				lappend errs "Error: module `$m' seems to be absent."
			} else {
				if ![dict exists $mknown $m] {
					dict append mknown $m 1
					if [dict exists $cur deps] {
						set deps [dict get $cur deps]
					} else { set deps [list]}
					set out "$out[include $deps]\n\n(function (\$) \{[dict get $cur src]\})(Pnchk);"
				}
			}
		}
		if [llength $errs] {
			foreach e $errs {
				puts stderr $e
			}
			exit
		} else {
			return $out
		}
	}
	set mknown [dict create]
	return [include $mods]
}