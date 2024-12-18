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
