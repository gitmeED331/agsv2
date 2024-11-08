/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Widget, astalify, Gtk, ConstructProps } from "astal/gtk4";
import { GObject } from "astal";

class Fixed extends astalify(Gtk.Fixed) {
	static {
		GObject.registerClass(this);
	}

	constructor(props: ConstructProps<Fixed, Gtk.Fixed.ConstructorProps>) {
		super(props as any);
	}
}

export default Fixed;
