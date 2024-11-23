/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Widget, astalify, Gtk, ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class SearchEntry extends astalify(Gtk.SearchEntry) {
    static {
        GObject.registerClass(this);
    }

    constructor(props: ConstructProps<SearchEntry, Gtk.SearchEntry.ConstructorProps>) {
        super(props as any);
    }
}

export default SearchEntry;
