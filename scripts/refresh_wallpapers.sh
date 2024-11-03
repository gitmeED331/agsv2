#!/bin/bash

# MIT License
#
# Copyright (c) 2024 TopsyKrets
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

CACHE_DIR="/tmp/wallpaper_cache"
WALLPAPER_DIR="$HOME/Pictures/Wallpapers"

initialize_cache_directory() {
    mkdir -p "$CACHE_DIR"
}

scale_and_cache_image() {
    local original_path="$1"
    local width="$2"
    local height="$3"
    local cached_image_path
    cached_image_path="${CACHE_DIR}/$(basename "$original_path")"

    convert "$original_path" -resize "${width}x${height}" "$cached_image_path"
    echo "Cached image: $cached_image_path"
}

remove_orphaned_cached_images() {
    echo "Checking for orphaned cached images..."
    for cached_file in "$CACHE_DIR"/*; do
        local original_file="${WALLPAPER_DIR}/$(basename "$cached_file")"
        if [ ! -f "$original_file" ]; then
            echo "Removing orphaned cached image: $cached_file"
            rm -f "$cached_file"
        fi
    done
}

update_cache() {
    echo "Updating cache based on wallpapers folder..."
    local wallpapers=()
    local unique_basenames=()

    while IFS= read -r -d '' file; do
        local base_name
        base_name=$(basename "$file" | sed 's/\.[^.]*$//')

        if [[ ! " ${unique_basenames[@]} " =~ " ${base_name} " ]]; then
            unique_basenames+=("$base_name")
            wallpapers+=("$file")
        fi
    done < <(find "$WALLPAPER_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

    for wallpaper in "${wallpapers[@]}"; do
        cached_image="${CACHE_DIR}/$(basename "$wallpaper")"
        if [ ! -f "$cached_image" ]; then
            echo "Caching new or modified wallpaper: $wallpaper"
            scale_and_cache_image "$wallpaper" 100 100
        fi
    done
}

initialize_cache_directory
remove_orphaned_cached_images
update_cache
