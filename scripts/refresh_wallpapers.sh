#!/bin/bash

# Define cache directory and source directory
CACHE_DIR="/tmp/wallpaper_cache"
WALLPAPER_DIR="$HOME/Pictures/Wallpapers"

# Function to create cache directory if it doesn't exist
initialize_cache_directory() {
    mkdir -p "$CACHE_DIR"
}

# Function to scale and cache an image
scale_and_cache_image() {
    local original_path="$1"
    local width="$2"
    local height="$3"
    local cached_image_path
    cached_image_path="${CACHE_DIR}/$(basename "$original_path")"

    # Scale the image and save to cache
    convert "$original_path" -resize "${width}x${height}" "$cached_image_path"
    echo "Cached image: $cached_image_path"
}

# Function to remove cached images that no longer have a corresponding original image
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

# Function to update the cache based on the wallpapers folder
update_cache() {
    echo "Updating cache based on wallpapers folder..."
    local wallpapers=()
    local unique_basenames=()

    # Iterate through .png, .jpg, and .jpeg files in the directory
    while IFS= read -r -d '' file; do
        local base_name
        base_name=$(basename "$file" | sed 's/\.[^.]*$//')

        # If basename is unique, add to array and cache image if needed
        if [[ ! " ${unique_basenames[@]} " =~ " ${base_name} " ]]; then
            unique_basenames+=("$base_name")
            wallpapers+=("$file")
        fi
    done < <(find "$WALLPAPER_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

    # Process each wallpaper
    for wallpaper in "${wallpapers[@]}"; do
        cached_image="${CACHE_DIR}/$(basename "$wallpaper")"
        if [ ! -f "$cached_image" ]; then
            echo "Caching new or modified wallpaper: $wallpaper"
            scale_and_cache_image "$wallpaper" 100 100
        fi
    done
}

# Main execution
initialize_cache_directory
remove_orphaned_cached_images
update_cache
