import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, execAsync, GLib, GObject } from "astal";
import cairo from "gi://cairo";

const drawShape = (ctx: cairo.Context, width: number, height: number) => {
    // Set up a custom path using basic Cairo methods
    ctx.new_path();  // Start a new path
    ctx.moveTo(0, height);  // Move to the bottom left
    ctx.lineTo(0, height - 100);  // Draw a vertical line
    ctx.lineTo(width, height - 100);  // Draw a horizontal line across the width
    ctx.lineTo(width, height);  // Draw another vertical line down
    ctx.closePath();  // Close the path
    ctx.fill();  // Fill the path with the current color
};

const createMirroredWidget = (flipHorizontal: boolean, flipVertical: boolean, cssClass: string): Gtk.DrawingArea => {
    const drawingArea = new Gtk.DrawingArea();

    // Apply the CSS class directly using the style context
    const styleContext = drawingArea.get_style_context();
    styleContext.add_class(cssClass);

    drawingArea.connect('draw', (widget: Gtk.Widget, ctx: cairo.Context) => {
        // Get the allocation size of the widget dynamically
        const allocation = widget.get_allocation();
        const width = allocation.width;
        const height = allocation.height;

        // Get the style context for the widget
        const styleContext = widget.get_style_context();

        // Retrieve the CSS color property using Gtk.StyleContext
        const color = styleContext.get_color(Gtk.StateFlags.NORMAL);

        // Set the color in the Cairo context using the RGBA values
        ctx.setSourceRGBA(color.red, color.green, color.blue, color.alpha);

        // Apply mirroring transformations if specified
        ctx.save();
        if (flipHorizontal) {
            ctx.scale(-1, 1);
            ctx.translate(-width, 0);
        }
        if (flipVertical) {
            ctx.scale(1, -1);
            ctx.translate(0, -height);
        }

        drawShape(ctx, width, height);
        ctx.restore();

        return false;
    });

    return drawingArea;
};

// Export each version as a widget with their own style classes
export const BottomRightWidget = (): Gtk.DrawingArea => {
    return createMirroredWidget(false, false, 'bottom-right-shape');
};

export const BottomLeftWidget = (): Gtk.DrawingArea => {
    return createMirroredWidget(true, false, 'bottom-left-shape');
};

export const TopRightWidget = (): Gtk.DrawingArea => {
    return createMirroredWidget(false, true, 'top-right-shape');
};

export const TopLeftWidget = (): Gtk.DrawingArea => {
    return createMirroredWidget(true, true, 'top-left-shape');
};
