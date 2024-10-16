import { Widget, Gtk } from "astal";

export type StackSidebarProps = Widget.ConstructProps<Gtk.StackSidebar, Gtk.StackSidebar.ConstructorProps>;

export const StackSidebar = Widget.astalify<typeof Gtk.StackSidebar, StackSidebarProps, "StackSidebar">(Gtk.StackSidebar);
export type StackSidebar = ReturnType<typeof StackSidebar>;
