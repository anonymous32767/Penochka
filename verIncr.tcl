#!/usr/bin/tclsh
# Increments version number

source version.tcl
set build [expr $build + 1]
set v [open version.tcl w]
puts $v "set build {$build}"
puts $v "set pversion {$pversion}"
puts $v "set gversion {$gversion}"
close $v