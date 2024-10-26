import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3"
import { GObject } from "astal";

class Stack extends astalify(Gtk.Stack) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        Stack,
        Gtk.Stack.ConstructorProps
    >) {
        super(props as any)
    }
}

export default Stack