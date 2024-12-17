import { Gtk, astalify, type ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class ListBox extends astalify(Gtk.ListBox) {
    static {
        GObject.registerClass(this);
    }

    constructor(props: ConstructProps<ListBox, Gtk.ListBox.ConstructorProps>) {
        super(props as any);
    }
}


export default ListBox
