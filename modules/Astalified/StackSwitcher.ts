/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class StackSwitcher extends astalify(Gtk.StackSwitcher) {
	static {
		GObject.registerClass(this);
	}

	constructor(props: ConstructProps<StackSwitcher, Gtk.StackSwitcher.ConstructorProps>) {
		super(props as any);
	}
}

export default StackSwitcher;
