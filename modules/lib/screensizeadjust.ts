import { Gdk, Gtk } from "astal/gtk3";

/*
 * 		value must between 0 and 1
 * @param {number} value
 */

export default function ScreenSizing({ type, multiplier }: { type: "width" | "height", multiplier: number }) {
	const Width = Gdk.Screen.get_default()?.get_width();
	const Height = Gdk.Screen.get_default()?.get_height();

	if (Width == null || Height == null) {
		throw new Error("No default screen available");
	}

	switch (type) {
		case "width": return Width! * multiplier
		case "height": return Height! * multiplier

	}
}
