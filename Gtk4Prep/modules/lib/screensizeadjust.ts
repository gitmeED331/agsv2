/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Gdk, Gtk } from "astal/gtk4";

/*
 * 		value must between 0 and 1
 * @param {number} value
 */

export const winheight = (value: number) => {
	const display = Gdk.Display.get_default();
	const monitor = display?.get_primary_monitor();
	const screenHeight = monitor?.get_workarea().height;

	if (screenHeight === undefined) {
		throw new Error("No default monitor available");
	}

	return screenHeight * value;
};

export const winwidth = (value: number) => {
	const display = Gdk.Display.get_default();
	const monitor = display?.get_primary_monitor();
	const screenWidth = monitor?.get_workarea().width;

	if (!screenWidth) {
		throw new Error("No default monitor available");
	}

	return screenWidth * value;
};

export function getWidgetPosition(widget: Gtk.Widget) {
	// Get the (x, y) position relative to the root window
	const [success, x, y] = widget.translate_coordinates(widget.get_root()!, 0, 0);
	if (!success) {
		console.error("Unable to determine widget position");
		return;
	}

	console.log(`Widget is located at (x: ${x}, y: ${y}) on the screen.`);
}
