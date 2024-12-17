import { Gtk, Gdk, Widget, astalify, ConstructProps } from "astal/gtk3";
import { GObject } from "astal";

class StackSidebar extends astalify(Gtk.StackSidebar) {
	static {
		GObject.registerClass(this);
	}

	constructor(props: ConstructProps<StackSidebar, Gtk.StackSidebar.ConstructorProps>) {
		super(props as any);
	}
}

export default StackSidebar;
