import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3"
import { GObject } from "astal";

// export type StackProps = Widget.ConstructProps<Gtk.Stack, Gtk.Stack.ConstructorProps>;

// export const Stack = Widget.astalify<typeof Gtk.Stack, StackProps, "Stack">(Gtk.Stack);
// export type Stack = ReturnType<typeof Stack>;

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