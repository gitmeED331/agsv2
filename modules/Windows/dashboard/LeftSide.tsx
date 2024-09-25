import { Astal, bind, Widget, Gtk, App, Gdk, Variable } from "astal";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import Icon, { Icons } from "../../lib/icons";
import { StackSwitcher } from "../../Astalified/StackSwitcher";

// --- imported widgets ---
import { BrightnessSlider, GridCalendar, PowerProfiles, AudioMixer, SessionControls } from "../../Widgets/index";
import NotificationList from "./notificationList";

export default function LeftSide() {
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
		hexpand: true,
		vexpand: true,
	});

	theStack.add_titled(GridCalendar(), "calendar", "Calendar");
	theStack.add_titled(power, "power", "Power Controls");
	theStack.add_titled(settings, "settings", "Settings");

	const stackSwitcher = new StackSwitcher({
		className: "dashboard stackSwitcher",
		stack: theStack,
		halign: Gtk.Align.CENTER,
		valign: Gtk.Align.START,
		spacing: 10,
	});

	return (
		<box className={"dashboard leftSide"} vertical={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.START} hexpand={true} vexpand={true} spacing={10}>
			{[stackSwitcher, theStack]}
		</box>
	);
}
