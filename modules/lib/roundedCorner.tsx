import { Widget, Gtk, Astal } from "astal";

/**
 * @param {string} place
 * @param {*} props
 */
export const RoundedCorner = (place, props) => {
  <drawingarea
    ...props
  halign={place.includes("left") ? "Gtk.Align.START" : "Gtk.Align.END"}
valign={place.includes("top") ? "Gtk.Align.START" : "Gtk.Align.END"}

    setup={(widget) => {
      //HACK: ensure a minimum size required for the window to even show up.
      //size chande later from css
      const r = 2;
      widget.set_size_request(r, r);
      widget.on("draw", (widget, cr) => {
        const r = widget
          .get_style_context()
          .get_property("font-size", Gtk.StateFlags.NORMAL);
        widget.set_size_request(r, r);

        switch (place) {
          case "topleft":
            cr.arc(r, r, r, Math.PI, (3 * Math.PI) / 2);
            cr.lineTo(0, 0);
            break;
          case "topright":
            cr.arc(0, r, r, (3 * Math.PI) / 2, 2 * Math.PI);
            cr.lineTo(r, 0);
            break;
          case "bottomleft":
            cr.arc(r, 0, r, Math.PI / 2, Math.PI);
            cr.lineTo(0, r);
            break;
          case "bottomright":
            cr.arc(0, 0, r, 0, Math.PI / 2);
            cr.lineTo(r, r);
            break;
        }

        cr.closePath();
        cr.clip();
        Gtk.render_background(widget.get_style_context(), cr, 0, 0, r, r);
      });
}}
  />
}

/**
 * @param {string} place
 * @param {*} props
 */
export const RoundedAngleEnd = (place, props) => {
  <drawingarea
    ...props
    setup={(widget) => {
      const ratio = 1.5;
      const r = widget.get_allocated_height();
      widget.set_size_request(ratio * r, r);
      widget.on("draw", (widget, cr) => {
        const context = widget.get_style_context();
        const border_color = context.get_property(
          "color",
          Gtk.StateFlags.NORMAL,
        );
        const border_width = context.get_border(Gtk.StateFlags.NORMAL).bottom;
        const r = widget.get_allocated_height();
        widget.set_size_request(ratio * r, r);
        switch (place) {
          case "topleft":
            cr.moveTo(0, 0);
            cr.curveTo((ratio * r) / 2, 0, (ratio * r) / 2, r, ratio * r, r);
            cr.lineTo(ratio * r, 0);
            cr.closePath();
            cr.clip();
            Gtk.render_background(context, cr, 0, 0, r * ratio, r);
            cr.moveTo(0, 0);
            cr.curveTo((ratio * r) / 2, 0, (ratio * r) / 2, r, ratio * r, r);
            cr.setLineWidth(border_width * 2);
            cr.setSourceRGBA(
              border_color.red,
              border_color.green,
              border_color.blue,
              border_color.alpha,
            );
            cr.stroke();
            break;

          case "topright":
            cr.moveTo(ratio * r, 0);
            cr.curveTo((ratio * r) / 2, 0, (ratio * r) / 2, r, 0, r);
            cr.lineTo(0, 0);
            cr.closePath();
            cr.clip();
            Gtk.render_background(context, cr, 0, 0, r * ratio, r);
            cr.moveTo(ratio * r, 0);
            cr.curveTo((ratio * r) / 2, 0, (ratio * r) / 2, r, 0, r);
            cr.setLineWidth(border_width * 2);
            cr.setSourceRGBA(
              border_color.red,
              border_color.green,
              border_color.blue,
              border_color.alpha,
            );
            cr.stroke();
            break;

          case "bottomleft":
            cr.moveTo(0, r);
            cr.curveTo((ratio * r) / 2, r, (ratio * r) / 2, 0, ratio * r, 0);
            cr.lineTo(ratio * r, r);
            cr.closePath();
            cr.clip();
            Gtk.render_background(context, cr, 0, 0, r * ratio, r);
            cr.moveTo(0, r);
            cr.curveTo((ratio * r) / 2, r, (ratio * r) / 2, 0, ratio * r, 0);
            cr.setLineWidth(border_width * 2);
            cr.setSourceRGBA(
              border_color.red,
              border_color.green,
              border_color.blue,
              border_color.alpha,
            );
            cr.stroke();
            break;

          case "bottomright":
            cr.moveTo(ratio * r, r);
            cr.curveTo((ratio * r) / 2, r, (ratio * r) / 2, 0, 0, 0);
            cr.lineTo(0, r);
            cr.closePath();
            cr.clip();
            Gtk.render_background(context, cr, 0, 0, r * ratio, r);
            cr.moveTo(ratio * r, r);
            cr.curveTo((ratio * r) / 2, r, (ratio * r) / 2, 0, 0, 0);
            cr.setLineWidth(border_width * 2);
            cr.setSourceRGBA(
              border_color.red,
              border_color.green,
              border_color.blue,
              border_color.alpha,
            );
            cr.stroke();
            break;
        }
        // cr.setLineWidth(border_width);
        // cr.setSourceRGBA(border_color.red, border_color.green, border_color.blue, border_color.alpha);
      });
}}
  />
}

export const CornerTopleft = () =>
  <window
		name={"cornertl"}
		layer={Astal.Layer.TOP}
		anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT }
    exclusivity={Astal.Exclusivity.NORMAL}
		visible={true}
		>
			{RoundedCorner("topleft", { className: "corner" })}
    </window>

export const CornerTopright = () =>
	<window
		name={"cornertr"}
		layer={Astal.Layer.TOP}
		anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT }
		exclusivity={Astal.Exclusivity.NORMAL}
visible={true}
	>
    { RoundedCorner("topright", { className: "corner" }) }
  </window>
export const CornerBottomleft = () =>
	<window
		name={"cornerbl"}
    layer={Astal.Layer.TOP}
    anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT }
    exclusivity={Astal.Exclusivity.NORMAL}
		visible={true}
	>
    {RoundedCorner("bottomleft", { className: "corner" }),
    </window>
export const CornerBottomright = () =>
	<window
		name={"cornerbr"}
    layer={Astal.Layer.TOP}
    anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT }
		exclusivity={Astal.Exclusivity.NORMAL}
visible={true}
>
	{RoundedCorner("bottomright", { className: "corner" })}
</window>

export default RoundedCorner;
