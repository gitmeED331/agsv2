import { Astal, bind, Widget, Gtk, App, Gdk, Variable } from "astal";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import Mpris from "gi://AstalMpris";
import Icon, { Icons } from "../../lib/icons";
import { StackSwitcher } from "../../Astalified/StackSwitcher";

// --- imported widgets ---
import { BrightnessSlider, GridCalendar, Player, PowerProfiles, Tray, BluetoothDevices, EthernetWidget, WifiAPs, AudioMixer, SessionControls } from "../../Widgets/index";
import NotificationList from "./notificationList";

const player = Mpris.Player.new("Deezer");

function LeftSide() {
	const settings = (
		<box name={"settings"} vertical={true} spacing={10}>
			<AudioMixer />
			<BrightnessSlider />
		</box>
	);
	const power = (
		<box name={"power"} className={"dashboard power"} vertical={true} spacing={10}>
			<PowerProfiles />
			<SessionControls />
		</box>
	);
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

	theStack.add_titled(GridCalendar(), "calendar", "Calendar");
	theStack.add_titled(power, "power", "Power Controls");
	theStack.add_titled(settings, "settings", "Settings");

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
		<box className={"dashboard leftSide"} vertical={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.START} hexpand={true} vexpand={true} spacing={10}>
			{stackSwitcher}
			{theStack}
		</box>
	);
}

function RightSide() {
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

function Dashboard() {
	const content = (
		<box
			className={"dashboard container"}
			vertical={true}
			vexpand={true}
			hexpand={false}
			valign={Gtk.Align.START}
			halign={Gtk.Align.CENTER}
			heightRequest={winheight(0.5)}
			widthRequest={winwidth(0.25)}
			css={`
				padding: 1.5rem;
			`}
			clickThrough={false}
		>
			<box vertical={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={10}>
				<Player player={player} />
			</box>
			<box vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={10}>
				<LeftSide />
				<Tray />
				<RightSide />
			</box>
		</box>
	);
	return (
		<window
			name={"dashboard"}
			className={"dashboard window"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
		>
			<eventbox
				valign={Gtk.Align.FILL}
				halign={Gtk.Align.FILL}
				onKeyPressEvent={(_, event) => {
					if (event.get_keyval()[1] === Gdk.KEY_Escape) {
						App.toggle_window("dashboard");
					}
				}}
				// onClick={(btn, event) => {
				//   if (event.button === Gdk.BUTTON_PRIMARY) {
				//     App.toggle_window("dashboard");
				//   }
				// }}
			>
				{content}
			</eventbox>
		</window>
	);
}
export default Dashboard;
