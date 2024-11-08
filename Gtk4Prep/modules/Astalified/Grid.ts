/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Gtk, Gdk, Widget, astalify, type ConstructProps } from "astal/gtk4";
import { GObject } from "astal";

class Grid extends astalify(Gtk.Grid) {
	static {
		GObject.registerClass(this);
	}

	constructor(props: ConstructProps<Grid, Gtk.Grid.ConstructorProps, { onAttach: [widget: Widget, column: number, row: number, colSpan: number, rowSpan: number] }>) {
		super(props as any);
	}
}

export default Grid;
