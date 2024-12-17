import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class Spinner extends astalify(Gtk.Spinner) {
	static {
		GObject.registerClass(this);
	}

	constructor(props: ConstructProps<Spinner, Gtk.Spinner.ConstructorProps>) {
		super(props as any);
	}
}

export default Spinner;
