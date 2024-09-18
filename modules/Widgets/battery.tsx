import { App, Gtk, Gdk, Variable, bind, GLib } from "astal";
import Icon from "../lib/icons";
import powerProfiles from "gi://AstalPowerProfiles";
import Battery from "gi://AstalBattery";

const battery = Battery.get_default();
const PowerProfiles = powerProfiles.get_default();
const percentage = bind(battery, "percentage")
const charging = bind(battery, "charging")

const chargeTooltip = () => {
	return charging.get() === true ? "Charging" : "Discharging"
}

const chargeIcon = () => {
	if (charging.get() === true) {
		return Icon.battery.Charging
	}
	if (charging.get() === false) {
		return Icon.battery.Discharging
	}
}

const ChargeIndicatorIcon = () => {
	return (
		<icon
			tooltipText={charging.as(chargeTooltip)}
			icon={charging.as(chargeIcon)}
		/>
	)
}

const PercentageReveal = Variable(true)

const PercentLabel = () => {
	const TheLabel = bind(battery, "percentage").as(p => `${p * 100}%`)
	return (
		<label
			label={TheLabel}
			tooltipText={bind(battery, "charging").as(chargeTooltip)}
		/>
	)
}

const TheLabelReveal = () => {
	return (
		<revealer
			transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
			transitionDuration={300}
			clickThrough={true}
			revealChild={PercentageReveal()}
		>
			<PercentLabel />
		</revealer>
	)
}

const BatteryLevelBar = ({ blocks = 10 }) => {
	return (
		<levelbar
			orientation={Gtk.Orientation.HORIZONTAL}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			max_value={blocks}
			mode={Gtk.LevelBarMode.CONTINUOUS}
			tooltipText={bind(PowerProfiles, "active_profile")}
			value={percentage.as(p => (p * blocks))}
		/>
	)
}

function BatteryButton() {
	const batterybuttonclassname = () => {
		const classes = [];

		if (percentage.get() <= 0.3) {
			classes.push("low");
		}
		if (charging.get() === true) {
			classes.push("charging");
		}
		if (charging.get() === false) {
			classes.push("discharging");
		}
		classes.push("battery");

		return classes.join(" ");
	}

	return (

		<button
			className={`${batterybuttonclassname()}`}
			hexpand={true}
			visible={true}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const win = App.get_window("sessioncontrols");
					if (win) {
						win.visible = !win.visible;
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					PercentageReveal.set(!PercentageReveal.get());
				}
			}}
		>
			<box
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
				spacing={3}
			>
				<TheLabelReveal />
				<ChargeIndicatorIcon />
				<BatteryLevelBar />
			</box>
		</button >

	)
}

export default BatteryButton