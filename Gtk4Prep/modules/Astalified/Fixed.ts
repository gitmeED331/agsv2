import { Widget, astalify, Gtk, ConstructProps } from "astal/gtk4"
import { GObject } from "astal"

class Fixed extends astalify(Gtk.Fixed) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        Fixed,
        Gtk.Fixed.ConstructorProps
    >) {
        super(props as any)
    }
}

export default Fixed