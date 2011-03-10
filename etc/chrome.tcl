#
# Penochka formatter for Chrome.
#
# Requires 7zip and openssl installed.
#
# @http://code.google.com/chrome/extensions/packaging.html
# @http://grack.com/blog/2009/11/09/packing-chrome-extensions-in-python/
# @http://code.google.com/p/extension-rake/
#

proc pipeb {cmd} {
    if [catch {set fp [open "|$cmd" r]
        fconfigure $fp -translation binary
        set result [read $fp]
        close $fp
    } r] {
        return $result
    } else {
        return $result
    }
}

proc putsb {h data} {puts -nonewline $h $data}

# Possibly intresting bit.
# This makes CRX chrome extension from zip archive.
proc makeCrx {zip key out} {
    set signature [pipeb "openssl sha1 -sign $key $zip"]
    set pubkey [pipeb "openssl rsa -pubout -inform PEM -outform DER -in $key"]

    set crx [open "$out" w]
    fconfigure $crx -translation binary

    putsb $crx "Cr24"
    putsb $crx [binary format iii 2 [string length $pubkey] [string length $signature]]
    putsb $crx $pubkey
    putsb $crx $signature

    set inz [open $zip r]
    fconfigure $inz -translation binary

    putsb $crx [read $inz]

    close $inz
    close $crx
}

# Doesn't work. Kept here to remember command line switches
proc makeKey {out} {
    exec openssl req -x509 -nodes -days 3650 -newkey rsa:1024 -keyout $out -out $out.cert
}

proc make {js version includes excludes output} {
    set includes "\"[join $includes {", "}]\""

    set fp [open "manifest.json" w]
    puts $fp "{\"name\": \"Penochka\", \"description\": \"Penochka imageboard script.\", \"version\": \"$version\", \"icons\": \{ \"16\": \"etc/icon16.png\", \"48\": \"etc/icon48.png\", \"128\": \"etc/icon128.png\" \}, \"permissions\": \[\"tabs\", $includes\], \"content_scripts\": \[{\"matches\": \[$includes\],\"run_at\": \"document_start\",\"js\": \[\"$output.js\"\]}\]}"
    close $fp

    append js "\ndocument.addEventListener('DOMContentLoaded', function () { to('init') });\n"
    set fp [open "$output.js" w]
    puts $fp $js
    close $fp

    exec 7z a $output.zip -tzip -mx=9 manifest.json etc/icon16.png etc/icon48.png etc/icon128.png "$output.js"

    makeCrx "$output.zip" "$output.pem" "$output.crx"

    # Delete temporary files
    file delete "$output.js"
    file delete "$output.zip"
    file delete manifest.json
}