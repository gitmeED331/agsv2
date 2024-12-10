import { Widget, Gtk } from "astal/gtk3";
import { StackSwitcher, Stack, StackSidebar } from "../../Astalified/index";

// --- imported widgets ---
import {
	BluetoothDevices,
	EthernetWidget,
	WifiAPs
} from "../../Widgets/index";
import NotificationList from "./notificationList";

export let dashboardRightStack: Stack;

export default function RightSide() {
	const rightStack = (
		<Stack
			transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
			transitionDuration={300}
			halign={FILL}
			valign={FILL}
			hhomogeneous={true}
			vhomogeneous={false}
			visible={true}
			hexpand={false}
			vexpand={true}
			setup={(self) => {
				self.add_titled(NotificationList(), "notifications", "Notifications");
				self.add_titled(
					<box className={"network dashboard"} vertical={true} spacing={5}>
						<EthernetWidget />
						<WifiAPs />
					</box>,
					"network",
					"Network",
				);
				self.add_titled(BluetoothDevices(), "bluetooth", "Bluetooth");
			}}
		/> as Stack
	);

	dashboardRightStack = rightStack;

	const stackSwitcher = <StackSwitcher className={"dashboard stackSwitcher"} stack={rightStack} halign={CENTER} valign={START} spacing={10} />;

	return (
		<box className={"dashboard rightSide"} vertical={true} halign={START} valign={START} hexpand={true} vexpand={true} spacing={5} heightRequest={450} widthRequest={450}>
			{[stackSwitcher, rightStack]}
		</box>
	);
}
