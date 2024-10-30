import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { execAsync, exec, bind, GObject } from "astal";
import Icon, { Icons } from "../lib/icons";
import AstalPowerProfiles from "gi://AstalPowerProfiles";

const powerprofile = AstalPowerProfiles.get_default();

powerprofile.connect("notify::active-profile", () => {
	const brightnessLevels = {
		"power-saver": 20,
		balanced: 50,
		performance: 100,
	};

	const setBrightness = (level) => {
		execAsync(`light -S ${level}`);
	};

	const updateBrightness = () => {
		const level = brightnessLevels[powerprofile.activeProfile];
		setBrightness(level);
	};

	updateBrightness();
});

const SysButton = (action: string, label: string) => (
	<button
		onClick={(_, event) => {
			if (event.button === Gdk.BUTTON_PRIMARY) {
				powerprofile.activeProfile = action;
				currentBrightness();
			}
		}}
		className={bind(powerprofile, "activeProfile").as((c) => (c === action ? c : ""))}
	>
		<box vertical={true}>
			<icon icon={Icon.powerprofile[action]} />
			<label label={label} visible={label !== ""} />
		</box>
	</button>
);
function currentBrightness() {
	return parseInt(exec("light -G").trim());
}
function PowerProfiles() {
	return (
		<box className={"powerprofiles container"} name={"powerprofiles"} vertical={false} vexpand={false} hexpand={false} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
			{SysButton("power-saver", "Saver")}
			{SysButton("balanced", "Balanced")}
			{SysButton("performance", "Performance")}
		</box>
	);
}

export default PowerProfiles;
