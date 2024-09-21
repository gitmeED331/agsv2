import { Widget, Astal, Gtk } from "astal"

export type SpinnerProps = Widget.ConstructProps<
    Gtk.Spinner,
    Gtk.Spinner.ConstructorProps,
    {}
>
export const Spinner = Widget.astalify<
    typeof Gtk.Spinner,
    SpinnerProps,
    "Spinner"
>(Gtk.Spinner)
export type Spinner = ReturnType<typeof Spinner>