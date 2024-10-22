#!/bin/bash

# Define cache directory and source directory
CACHE_DIR="/tmp/wallpaper_cache"
WALLPAPER_DIR="$HOME/Pictures/Wallpapers"

# Create cache directory if it doesn't exist
mkdir -p "$CACHE_DIR"

# Function to get cached image path
get_cached_image_path() {
    local original_path="$1"
    local file_name
    file_name=$(basename "$original_path")
    echo "${CACHE_DIR}/${file_name}"
}

# Function to scale and cache an image
scale_and_cache_image() {
    local original_path="$1"
    local width="$2"
    local height="$3"
    local cached_image_path
    cached_image_path=$(get_cached_image_path "$original_path")

    # Check if cached image already exists
    if [ -f "$cached_image_path" ]; then
        echo "$cached_image_path"
        return 0
    fi

    # Scale the image and save to cache
    convert "$original_path" -resize "${width}x${height}" "$cached_image_path"
    if [ $? -eq 0 ]; then
        echo "$cached_image_path"
    else
        echo "Error scaling image: $original_path" >&2
        echo "$original_path"
    fi
}

# Function to get wallpapers from the folder and cache them
get_wallpapers_from_folder() {
    local wallpapers=()
    local unique_basenames=()

    # Iterate through .png, .jpg, and .jpeg files in the directory
    while IFS= read -r -d '' file; do
        local base_name
        base_name=$(basename "$file" | sed 's/\.[^.]*$//')

        # If basename is unique, add to array and cache image
        if [[ ! " ${unique_basenames[@]} " =~ " ${base_name} " ]]; then
            unique_basenames+=("$base_name")
            wallpapers+=("$file")
        fi
    done < <(find "$WALLPAPER_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

    # Sort wallpapers alphabetically
    IFS=$'\n' sorted_wallpapers=($(sort <<<"${wallpapers[*]}"))
    unset IFS

    echo "${sorted_wallpapers[@]}"
}

# Main script execution
main() {
    # Example width and height
    local width=100
    local height=100

    # Get list of wallpapers
    wallpapers=$(get_wallpapers_from_folder)

    for wallpaper in $wallpapers; do
        scale_and_cache_image "$wallpaper" "$width" "$height"
    done
}

# If script is called with arguments for a single image
if [ $# -eq 3 ]; then
    scale_and_cache_image "$1" "$2" "$3"
    exit 0
fi

# Run the main function if no arguments are passed
if [ $# -eq 0 ]; then
    main
fi
