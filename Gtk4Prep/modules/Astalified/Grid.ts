import { Gtk, Gdk, Widget, astalify, type ConstructProps } from "astal/gtk4"
import { GObject } from "astal";

class Grid extends astalify(Gtk.Grid) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        Grid,
        Gtk.Grid.ConstructorProps,
        { onAttach: [widget: Widget, column: number, row: number, colSpan: number, rowSpan: number] }
    >) {
        super(props as any)

    }
}

export default Grid