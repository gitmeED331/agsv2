import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class Image extends astalify(Gtk.Image) {
	static {
		GObject.registerClass(this);
	}

	constructor(props: ConstructProps<Image, Gtk.Image.ConstructorProps>) {
		super(props as any);
	}
}

export default Image;
