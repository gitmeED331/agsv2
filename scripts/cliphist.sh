# !/bin/bash

# MIT License
#
# Copyright (c) 2024 TopsyKrets
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#!/bin/bash

# List clipboard history
get() {
    cliphist list | iconv -f $(locale charmap) -t UTF-8 -c
}

# Copy an item by ID to the clipboard
copy_by_id() {
    local id="$1"
    echo "Copying item with ID: $id"  # Log the action
    cliphist decode "$id" | wl-copy
}

# Clear the clipboard history
clear() {
    echo "Clearing clipboard history."  # Log the clear action
    cliphist wipe
}

# Save a cache file for the given ID
save_cache_file() {
    local id="$1"
    local output_file="/tmp/ags/cliphist/$id.png"

    if [[ ! -f "$output_file" ]]; then
        mkdir -p "/tmp/ags/cliphist/"
        echo "Saving cache file: $output_file"  # Log the save action
        cliphist decode "$id" >"$output_file"
    fi

    echo $output_file
}

# Clear temporary cache files
clear_tmp() {
    echo "Clearing temporary cache files."  # Log the cache clear action
    rm -rf /tmp/ags/cliphist/*
}

monitor_clipboard() {
    LAST_CLIP_TEXT=""
    LAST_CLIP_IMAGE=""

    while true; do
        # Capture both text and image clipboard data
        CURRENT_CLIP_TEXT=$(wl-paste --type text)
        CURRENT_CLIP_IMAGE=$(wl-paste --type image)

        # Check for text changes
        if [[ "$CURRENT_CLIP_TEXT" != "$LAST_CLIP_TEXT" && -n "$CURRENT_CLIP_TEXT" ]]; then
            LAST_CLIP_TEXT="$CURRENT_CLIP_TEXT"
            echo "Storing text: $CURRENT_CLIP_TEXT"  # Log the storing action
            cliphist store "$CURRENT_CLIP_TEXT"  # Store text in cliphist
        fi

        # Check for image changes
        if [[ "$CURRENT_CLIP_IMAGE" != "$LAST_CLIP_IMAGE" && -n "$CURRENT_CLIP_IMAGE" ]]; then
            LAST_CLIP_IMAGE="$CURRENT_CLIP_IMAGE"
            echo "Storing image: $CURRENT_CLIP_IMAGE"  # Log the storing action
            cliphist store "$CURRENT_CLIP_IMAGE"  # Store image in cliphist
        fi

        # Additional logic to handle cases where only files are copied
        # If the CURRENT_CLIP_TEXT is empty but there is image data
        if [[ -z "$CURRENT_CLIP_TEXT" && -n "$CURRENT_CLIP_IMAGE" ]]; then
            echo "Detected file copy, but text clipboard is empty."
            # Decide whether to store or ignore based on your requirement
        fi

        sleep 1  # Adjust sleep duration as necessary
    done
}


if [[ "$1" == "--get" ]]; then
    get
elif [[ "$1" == "--copy-by-id" && -n "$2" ]]; then
    copy_by_id "$2"
elif [[ "$1" == "--save-by-id" && -n "$2" ]]; then
    save_cache_file "$2"
elif [[ "$1" == "--clear-cache" ]]; then
    clear_tmp
elif [[ "$1" == "--clear" ]]; then
    clear
elif [[ "$1" == "--monitor" ]]; then
    monitor_clipboard 
fi
