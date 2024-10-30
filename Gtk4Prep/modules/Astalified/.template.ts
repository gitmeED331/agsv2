/* change "[widget]" to the Gtk widget name */

import { Widget, Gtk, GObject, ConstructProps } from "astal/gtk3"
import { astalify } from "astal"

class WIDGET extends astalify(Gtk[WIDGET]) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        WIDGET,
        Gtk[WIDGET].ConstructorProps
    >) {
    super(props as any)
}
}

export default WIDGET