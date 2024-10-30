import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk4"
import { GObject } from "astal";

// export type ImageProps = Widget.ConstructProps<
//     Gtk.Image,
//     Gtk.Image.ConstructorProps
// >
// export const Image = Widget.astalify<
//     typeof Gtk.Image,
//     ImageProps,
//     "Image"
// >(Gtk.Image)
// export type Image = ReturnType<typeof Image>

class Image extends astalify(Gtk.Image) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        Image,
        Gtk.Image.ConstructorProps
    >) {
        super(props as any)
    }
}

export default Image