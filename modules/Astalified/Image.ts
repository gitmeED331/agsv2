import { Widget, Gtk } from "astal"

export type ImageProps = Widget.ConstructProps<
    Gtk.Image,
    Gtk.Image.ConstructorProps
>
export const Image = Widget.astalify<
    typeof Gtk.Image,
    ImageProps,
    "Image"
>(Gtk.Image)
export type Image = ReturnType<typeof Image>
