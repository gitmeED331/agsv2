import { Gdk, Gtk } from "astal/gtk3";

/*
 * 		value must between 0 and 1
 * @param {number} value
 */

export const winheight = (value: number) => {
	const screenHeight = Gdk.Screen.get_default()?.get_height();
	if (screenHeight === undefined) {
		throw new Error("No default screen available");
	}
	const winheight = screenHeight * value;
	return winheight;
};

export const winwidth = (value: number) => {
	const screenWidth = Gdk.Screen.get_default()?.get_width();
	if (!screenWidth) {
		throw new Error("No default screen available");
	}
	const winwidth = screenWidth * value;
	return winwidth;
};

export function getWidgetPosition(widget: Gtk.Widget) {
	// Get the widget's Gdk.Window, where the widget is drawn
	const gdkWindow = widget.get_window();
	if (!gdkWindow) {
		console.error("Widget has no associated Gdk.Window");
		return;
	}

	// Get the (x, y) position relative to the screen
	const [x, y] = gdkWindow.get_origin();
	console.log(`Widget is located at (x: ${x}, y: ${y}) on the screen.`);
}
