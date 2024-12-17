import { Widget, astalify, Gtk, ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class RegularWindow extends astalify(Gtk.Window) {
    static {
        GObject.registerClass(this);
    }

    constructor(props: ConstructProps<
        RegularWindow,
        Gtk.Window.ConstructorProps

    >) {
        super(props as any);
    }
}

export default RegularWindow;



