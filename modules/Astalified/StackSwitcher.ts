import { Astal, Widget, Gtk, Gdk } from "astal";

export type StackSwitcherProps = Widget.ConstructProps<Gtk.StackSwitcher, Gtk.StackSwitcher.ConstructorProps>;

export const StackSwitcher = Widget.astalify<typeof Gtk.StackSwitcher, StackSwitcherProps, "StackSwitcher">(Gtk.StackSwitcher);
export type StackSwitcher = ReturnType<typeof StackSwitcher>;
