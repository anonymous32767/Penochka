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

# Script version
source version.tcl

# Browser configurations
proc chrome  {} {
   global gversion build;
   return [list "govno.unstable" "[join $gversion {.}].$build" "chrome.tcl"]}

proc firefox {} {
   global gversion build;
   return [list "govno.unstable" "[join $gversion {.}].$build" "gm.tcl"]}

proc opera   {} {
   global pversion build;
   return [list "penochka.unstable" "[join $pversion {.}].$build" "userjs.tcl"]}

# Web system
cd etc
source modules.tcl
cd ..

proc srcdir {{name .}} {
   foreach f [glob -nocomplain -directory $name -type f *.js] {
      load $f
   }
   foreach subdir [glob -nocomplain -directory $name -type d *] {
      srcdir $subdir
   }
}


# Script internet namespace
set includes {"http://iichan.ru/*" "http://*.iichan.ru/*" "http://02ch.su/*" "http://*.02ch.su/*" "http://2-ch.ru/*" "http://*.2-ch.ru/*"}
set excludes {"*/src/*"}

# Do it
if { $argc != 1 } {
   puts {Usage: ./buildTool [opera|firefox|chrome]}
} else {
   set cur [[lindex $argv 0]]
   cd etc
   source [lindex $cur 2]
   source tangle.tcl
   source js2web.tcl
   cd ..

	# Caching jquery because it
	# Hangs our pretty regexp parser
	loadcached src/jq.jweb
	# Load other sources
   srcdir src
   set js [compile {russian 2-ch ui images neutron-css simple-settings discussmap preview unfolding form hiding loader}]

   regsub -all {UnStAbLe} $js [lindex $cur 1] js
   make $js [lindex $cur 1] $includes $excludes [lindex $cur 0]
}

