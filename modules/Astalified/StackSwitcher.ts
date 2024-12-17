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
