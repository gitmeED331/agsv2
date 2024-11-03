/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Widget, Gtk, ConstructProps, astalify } from "astal/gtk3";
import { GObject } from "astal";

class Notebook extends astalify(Gtk.Notebook) {
	static {
		GObject.registerClass(this);
	}

	constructor(props: ConstructProps<Notebook, Gtk.Notebook.ConstructorProps>) {
		super(props as any);
	}
}

export default Notebook;
