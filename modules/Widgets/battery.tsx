import { Gtk, Gdk, App } from "astal/gtk3";
import { Variable, bind } from "astal";

import Icon from "../lib/icons";
import powerProfiles from "gi://AstalPowerProfiles";
import Battery from "gi://AstalBattery";

let TRANSITION = 300
let BLOCKS = 10
const PercentageReveal = Variable(true);

const chargeTooltip = (charging: any) => charging ? "Charging" : "Discharging";

const chargeIcon = (charging: any) => charging ? Icon.battery.Charging : Icon.battery.Discharging;

const ChargeIndicatorIcon = ({ battery, charging }: { battery: Battery.Device, charging: any }) => (
	<icon
		className={bind(battery, "charging").as((c) => c ? "charging" : "discharging")}
		tooltipText={chargeTooltip(charging)}
		icon={chargeIcon(charging)}
	/>
);

const TheLabelReveal = ({ battery, charging }: { battery: Battery.Device, charging: any }) => {
	return (
		<revealer
			transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
			transitionDuration={TRANSITION}
			clickThrough={true}
			revealChild={bind(battery, "charging").as((c) => !c)}
		>
			<label
				label={bind(battery, "percentage").as((p) => `${p * 100}%`)}
				tooltipText={chargeTooltip(charging)} onDestroy={(self) => self.destroy()}
			/>
		</revealer>
	);
};

const BatteryLevelBar = (
	percent: any,
	power: powerProfiles.PowerProfiles,
	blocks: number = 10
) => (
	<levelbar
		orientation={Gtk.Orientation.HORIZONTAL}
		halign={CENTER}
		valign={CENTER}
		max_value={blocks}
		mode={Gtk.LevelBarMode.CONTINUOUS}
		tooltipText={bind(power, "active_profile")}
		value={percent.as((p: any) => p * blocks)}
	/>
);

function BatteryButton() {
	const Bat = Battery.get_default();
	const PowerProfiles = powerProfiles.get_default();

	const Percentage = bind(Bat, "percentage");
	const Charging = bind(Bat, "charging");

	const batteryButtonClassName = () => {
		const classes = ["battery"];
		if (Percentage.get() <= 0.3) classes.push("low");
		classes.push(Charging.get() ? "charging" : "discharging");
		return classes.join(" ");
	};

	return (
		<button
			className={batteryButtonClassName()}
			hexpand
			visible
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const win = App.get_window("sessioncontrols");
					if (win) win.visible = !win.visible;
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					// PercentageReveal.set(!PercentageReveal.get());
					App.toggle_window("systemstats")
				}
			}}
		>
			<box halign={CENTER} valign={CENTER} spacing={3}>
				{[
					TheLabelReveal({ battery: Bat, charging: Charging }),
					ChargeIndicatorIcon({ battery: Bat, charging: Charging }),
					BatteryLevelBar(Percentage, PowerProfiles, BLOCKS),
				]}
			</box>
		</button>
	);
}

export default BatteryButton;
