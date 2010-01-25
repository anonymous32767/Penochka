#!/usr/bin/tclsh

# @ http://wiki.tcl.tk/17275
proc srcdir {{name .}} {
	foreach f [glob -nocomplain -directory $name -type f *.jweb] {
	   source -encoding utf-8 $f
   }
   foreach subdir [glob -nocomplain -directory $name -type d *] {
	   srcdir $subdir
   }
}

cd web
source weave.tcl
cd ..

srcdir src

set ie 1
set gm 1

cd doc

wakaba
onechan
goblach
zerochan
dobrochan

imagesUnfolding
postsPreview
