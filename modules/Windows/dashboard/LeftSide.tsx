import { Gtk } from "astal";
import { StackSwitcher } from "../../Astalified/index";

// --- imported widgets ---
import { BrightnessSlider, GridCalendar, PowerProfiles, AudioMixer, SessionControls } from "../../Widgets/index";

export let dashboardLeftStack

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

	const leftStack = new Gtk.Stack({
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

	dashboardLeftStack = leftStack

	leftStack.add_titled(GridCalendar(), "calendar", "Calendar");
	leftStack.add_titled(power, "power", "System Controls");
	leftStack.add_titled(settings, "settings", "Settings");

	const stackSwitcher = new StackSwitcher({
		className: "dashboard stackSwitcher",
		stack: leftStack,
		halign: Gtk.Align.CENTER,
		valign: Gtk.Align.START,
		spacing: 10,
	});

	return (
		<box className={"dashboard leftSide"} vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.START} hexpand={true} vexpand={true} spacing={10}>
			{[stackSwitcher, leftStack]}
		</box>
	);
}
