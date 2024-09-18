import { Astal, Widget, Gtk, Variable, Binding, bind } from "astal"

export function createSurfaceFromWidget(widget: Gtk.Widget) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cairo = imports.gi.cairo as any
    const alloc = widget.get_allocation()
    const surface = new cairo.ImageSurface(
        cairo.Format.ARGB32,
        alloc.width,
        alloc.height,
    )
    const cr = new cairo.Context(surface)
    cr.setSourceRGBA(255, 255, 255, 0)
    cr.rectangle(0, 0, alloc.width, alloc.height)
    cr.fill()
    widget.draw(cr)
    return surface
}