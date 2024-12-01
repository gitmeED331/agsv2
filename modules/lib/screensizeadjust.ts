import { Gdk, Gtk } from "astal/gtk3";

/*
 * 		value must between 0 and 1
 * @param {number} value
 */

export const winheight = (value: number): number => {
	const screenHeight = Gdk.Screen.get_default()?.get_height();
	if (screenHeight == null) {
		throw new Error("No default screen available");
	}
	return screenHeight * value;
};

export const winwidth = (value: number): number => {
	const screenWidth = Gdk.Screen.get_default()?.get_width();
	if (screenWidth == null) {
		throw new Error("No default screen available");
	}
	return screenWidth * value;
};
