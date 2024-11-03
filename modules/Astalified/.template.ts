/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

/* change "[widget]" to the Gtk widget name */

import { Widget, Gtk, GObject, ConstructProps } from "astal/gtk3"
import { astalify } from "astal"

class WIDGET extends astalify(Gtk[WIDGET]) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        WIDGET,
        Gtk[WIDGET].ConstructorProps
    >) {
    super(props as any)
}
}

export default WIDGET
