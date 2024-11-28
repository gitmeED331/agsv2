import { Widget, astalify, Gtk, ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class ComboBox extends astalify(Gtk.ComboBox) {
    static {
        GObject.registerClass(this);
    }

    constructor(props: ConstructProps<ComboBox, Gtk.ComboBox.ConstructorProps>) {
        super(props as any);
    }
}

export default ComboBox;



