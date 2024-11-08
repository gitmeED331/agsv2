/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Gtk, astalify, type ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class Grid extends astalify(Gtk.Grid) {
	static {
		GObject.registerClass(this);
	}

	constructor(props: ConstructProps<Grid, Gtk.Grid.ConstructorProps>) {
		super(props as any);
	}
}

export default Grid;
