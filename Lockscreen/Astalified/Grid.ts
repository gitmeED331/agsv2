import { Astal, Widget, Gtk, Gdk } from "astal";

export type GridProps = Widget.ConstructProps<Gtk.Grid, Gtk.Grid.ConstructorProps>;

export const Grid = Widget.astalify<typeof Gtk.Grid, GridProps, "Grid">(Gtk.Grid);
export type Grid = ReturnType<typeof Grid>;
