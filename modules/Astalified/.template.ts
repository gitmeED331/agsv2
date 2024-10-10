/* change "[widget]" to the Gtk widget name */

import { Widget, Gtk } from "astal"

export type [widget]Props = Widget.ConstructProps<
    Gtk.[widget],
    Gtk.[widget].ConstructorProps
>
export const [widget] = Widget.astalify<
    typeof Gtk.[widget],
    [widget]Props,
    "[widget]"
>(Gtk.[widget])
export type [widget] = ReturnType<typeof [widget]>
