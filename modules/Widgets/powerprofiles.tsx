import { Gdk } from "astal/gtk3";
import { execAsync, exec, bind } from "astal";
import Icon, { Icons } from "../lib/icons";
import AstalPowerProfiles from "gi://AstalPowerProfiles";

function currentBrightness() {
	return parseInt(exec("light -G").trim());
}

function PowerProfiles() {
	const powerprofile = AstalPowerProfiles.get_default();

	powerprofile.connect("notify::active-profile", () => {
		const brightnessLevels: { [key: string]: number } = {
			"power-saver": 20,
			balanced: 50,
			performance: 100,
		};

		const setBrightness = (level: number) => {
			execAsync(`light -S ${level}`);
		};

		const updateBrightness = () => {
			const level = brightnessLevels[powerprofile.activeProfile];
			setBrightness(level);
		};

		updateBrightness();
	});

	type PowerProfileActions = "balanced" | "power-saver" | "performance";
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
				<icon icon={Icon.powerprofile[action as PowerProfileActions]} />
				<label label={label} visible={label !== ""} />
			</box>
		</button>
	);

	return (
		<box className={"powerprofiles container"} name={"powerprofiles"} vertical={false} vexpand={false} hexpand={false} valign={CENTER} halign={CENTER}>
			{SysButton("power-saver", "Saver")}
			{SysButton("balanced", "Balanced")}
			{SysButton("performance", "Performance")}
		</box>
	);
}

export default PowerProfiles;
