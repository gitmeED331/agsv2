import { Widget, Gtk, ConstructProps, astalify } from "astal/gtk3"
import { GObject } from "astal"

class Notebook extends astalify(Gtk.Notebook) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        Notebook,
        Gtk.Notebook.ConstructorProps
    >) {
        super(props as any)
    }
}

export default Notebook