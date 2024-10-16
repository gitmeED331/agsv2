import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3"
import { GObject } from "astal";

// export type SpinnerProps = Widget.ConstructProps<
//     Gtk.Spinner,
//     Gtk.Spinner.ConstructorProps
// >
// export const Spinner = Widget.astalify<
//     typeof Gtk.Spinner,
//     SpinnerProps,
//     "Spinner"
// >(Gtk.Spinner)
// export type Spinner = ReturnType<typeof Spinner>


class Spinner extends astalify(Gtk.Spinner) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        Spinner,
        Gtk.Spinner.ConstructorProps
    >) {
        super(props as any)
    }
}

export default Spinner