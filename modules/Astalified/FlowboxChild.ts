import { Gtk, astalify, type ConstructProps } from "astal/gtk3";
import { GObject } from "astal";


class FlowBoxChild extends astalify(Gtk.FlowBoxChild) {
    static {
        GObject.registerClass(this);
    }

    constructor(props: ConstructProps<FlowBoxChild, Gtk.FlowBoxChild.ConstructorProps>) {
        super(props as any);
    }
}


export default FlowBoxChild;
