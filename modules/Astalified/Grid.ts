import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3"
import { GObject } from "astal";

// export type GridProps = ConstructProps<Gtk.Grid, Gtk.Grid.ConstructorProps>;

// export const Grid = astalify<
//     typeof Gtk.Grid,
//     GridProps,
//     "Grid">
//     (Gtk.Grid);
// export type Grid = ReturnType<typeof Grid>;

// subclass, register, define constructor props
class Grid extends astalify(Gtk.Grid) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        Grid,
        Gtk.Grid.ConstructorProps
    >) {
        super(props as any)
    }
}

export default Grid