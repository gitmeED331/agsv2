import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3"
import { GObject } from "astal";


// export type StackSidebarProps = Widget.ConstructProps<Gtk.StackSidebar, Gtk.StackSidebar.ConstructorProps>;

// export const StackSidebar = Widget.astalify<typeof Gtk.StackSidebar, StackSidebarProps, "StackSidebar">(Gtk.StackSidebar);
// export type StackSidebar = ReturnType<typeof StackSidebar>;

class StackSidebar extends astalify(Gtk.StackSidebar) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        StackSidebar,
        Gtk.StackSidebar.ConstructorProps
    >) {
        super(props as any)
    }
}

export default StackSidebar