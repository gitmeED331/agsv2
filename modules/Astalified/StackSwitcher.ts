import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3"
import { GObject } from "astal";

// export type StackSwitcherProps = Widget.ConstructProps<Gtk.StackSwitcher, Gtk.StackSwitcher.ConstructorProps>;

// export const StackSwitcher = Widget.astalify<typeof Gtk.StackSwitcher, StackSwitcherProps, "StackSwitcher">(Gtk.StackSwitcher);
// export type StackSwitcher = ReturnType<typeof StackSwitcher>;

class StackSwitcher extends astalify(Gtk.StackSwitcher) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        StackSwitcher,
        Gtk.StackSwitcher.ConstructorProps
    >) {
        super(props as any)
    }
}

export default StackSwitcher