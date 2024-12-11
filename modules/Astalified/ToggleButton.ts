import { Widget, astalify, Gtk, ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class ToggleButton extends astalify(Gtk.ToggleButton) {
    static {
        GObject.registerClass(this);
    }

    constructor(props: ConstructProps<ToggleButton, Gtk.ToggleButton.ConstructorProps>) {
        super(props as any);
    }
}

export default ToggleButton;



