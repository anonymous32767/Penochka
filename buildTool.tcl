#!/usr/bin/tclsh
# Penochka building utility
#
# This requires tcl. If you under linux issue command like:
#   apt-get install tcl
#
# Under windows go to http://www.equi4.com/tclkit/download.html,
# download tclkit (Command line version), place it in your %PATH% or
# in this folder. Rename to tclkit.exe
#

source version.tcl

proc rglob {path ext} {
    set paths  [glob -type d $path/*]
    set paths [lappend paths $path]
    set out [list]
    foreach p $paths {
        set out [concat $out [glob $p/$ext]]
    }
    return $out
}

set srcdir ""
set src [lsort [rglob src *.js]]

set res [glob themes/*]

set includes {"http://iichan.ru/*" "http://*.iichan.ru/*" "http://02ch.su/*" "http://*.02ch.su/*" "http://2-ch.ru/*" "http://*.2-ch.ru/*" "http://*.0chan.ru/*" "http://dobrochan.ru/*"}

set excludes {"*/src/*"}

proc chrome  {} {
    global version build;
    return [list "penochka~" "[join $version {.}].$build" "chrome.tcl"]}

proc firefox {} {
    global version build;
    return [list "penochka~" "[join $version {.}].$build" "gm.tcl"]}

proc opera   {} {
    global version build;
    return [list "penochka~" "[join $version {.}].$build" "opera.tcl"]}

if { $argc != 1 } {
    puts {Usage: ./buildTool [opera|firefox|chrome]}
} else {
	source version.tcl
	set build [expr $build + 1]
	set v [open version.tcl w]
	puts $v "set build $build"
	puts $v "set version $version"
	close $v

    set curr [[lindex $argv 0]]
    cd etc
    source [lindex $curr 2]
    cd ..

    set js "\nvar penochka = {};\n\n"
    foreach i $src {
        set fp [open [file join [pwd] $srcdir $i] r]
        append js "[read $fp]\n"
        close $fp
    }
    foreach i $res {
        set fp [open [file join [pwd] $srcdir $i] r]
		set prepared [read $fp]
		regsub -all {\"} $prepared "\\\"" prepared
		regsub -all {\n} $prepared " " prepared
		regsub -all {\s+} $prepared " " prepared
		regsub {^.*\/} $i "" fn
        append js "\n/* File: $i */\non('$fn', function (x) { return \"$prepared\" })\n"
        close $fp
    }
    regsub -all {UnStAbLe} $js [lindex $curr 1] js
    make $js [lindex $curr 1] $includes $excludes [lindex $curr 0]
}