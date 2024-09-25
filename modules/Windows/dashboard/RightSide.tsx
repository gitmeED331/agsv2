import { Astal, bind, Widget, Gtk, App, Gdk, Variable } from "astal";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import Icon, { Icons } from "../../lib/icons";
import { StackSwitcher } from "../../Astalified/StackSwitcher";

// --- imported widgets ---
import { BluetoothDevices, EthernetWidget, WifiAPs } from "../../Widgets/index";
import NotificationList from "./notificationList";

export default function RightSide() {
	const theStack = new Gtk.Stack({
		transitionType: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
		transitionDuration: 300,
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.FILL,
		hhomogeneous: true,
		vhomogeneous: false,
		visible: true,
		hexpand: false,
		vexpand: true,
	});

	theStack.add_titled(NotificationList(), "notifications", "Notifications");
	theStack.add_titled(
		Widget.Box({
			className: "network dashboard",
			vertical: true,
			spacing: 5,
			children: [EthernetWidget(), WifiAPs()],
		}),
		"network",
		"Network",
	);
	theStack.add_titled(BluetoothDevices(), "bluetooth", "Bluetooth");

	function SSsetup(stackSwitcher: StackSwitcher) {
		stackSwitcher.set_stack(theStack);
	}

	const stackSwitcher = new StackSwitcher({
		className: "dashboard stackSwitcher",
		setup: SSsetup,
		halign: Gtk.Align.CENTER,
		valign: Gtk.Align.START,
		spacing: 10,
	});

	return (
		<box className={"dashboard rightSide"} vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={true} vexpand={true} spacing={5}>
			{stackSwitcher}
			{theStack}
		</box>
	);
}