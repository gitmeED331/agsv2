import { Astal, Widget, Gtk, Gdk } from "astal";

export type StackProps = Widget.ConstructProps<Gtk.Stack, Gtk.Stack.ConstructorProps>;

export const Stack = Widget.astalify<typeof Gtk.Stack, StackProps, "Stack">(Gtk.Stack);
export type Stack = ReturnType<typeof Stack>;
