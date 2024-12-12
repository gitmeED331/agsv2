import { Gtk, Gdk, App } from "astal/gtk3";
import { Variable, bind } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import { dashboardRightStack } from "../../Windows/dashboard/RightSide";

let btreveal = Variable(false);

const BluetoothWidget = (bluetooth: AstalBluetooth.Bluetooth) => {
	const updateLabel = (btLabel: Gtk.Label) => {
		const btEnabled = bluetooth.is_powered;
		const btDevices = bluetooth.is_connected;
		const label = btEnabled ? (btDevices ? ` (${btDevices})` : "On") : "Off";
		btLabel.label = label;
	};


	bluetooth.connect("notify::enabled", updateLabel);
	bluetooth.connect("notify::connected_devices", updateLabel);

	return (
		<box className={"bluetooth barbutton content"} halign={CENTER} valign={CENTER} visible={true} >
			{bind(bluetooth, "is_powered").as((showLabel) => (
				<box>
					<icon className={"bluetooth barbutton-icon"} icon={bind(bluetooth, "is_powered").as((v) => (v ? Icon.bluetooth.enabled : Icon.bluetooth.disabled))} />
					<revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} clickThrough={true} reveal_child={bind(btreveal)}>
						<label className={"bluetooth barbutton-label"} setup={updateLabel} />
					</revealer>
				</box>
			))}
		</box>
	);
};

export default function BluetoothButton() {
	const Bluetooth = AstalBluetooth.get_default();

	const tooltip = Variable.derive(
		[bind(Bluetooth, "is_connected"), bind(Bluetooth, "devices")],
		(is_connected, devices) => {
			if (is_connected) {
				const connectedDevices = devices
					.filter((device: AstalBluetooth.Device) => device.connected)
					.map(device => device.name);
				return connectedDevices.length
					? `Connected Devices:\n${connectedDevices.join("\n")}`
					: "No Devices Connected";
			}
			return "No Devices Connected";
		}
	);

	return (
		<button
			className={"bluetooth barbutton"}
			halign={CENTER}
			valign={CENTER}
			tooltip_text={bind(tooltip)}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const dashTab = "bluetooth";
					const win = App.get_window(`dashboard${App.get_monitors()[0]}`);
					const dashboardTab = dashboardRightStack.get_visible_child_name() === dashTab;
					const setDashboardTab = dashboardRightStack.set_visible_child_name(dashTab);
					if (win) {
						if (win.visible === true && !dashboardTab) {
							setDashboardTab;
							// } else if (win.visible === true && dashboardTab) {
							// 	win.visible = !win.visible;
						} else {
							win.visible = !win.visible;
						}
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					btreveal.set(!btreveal.get());
				}
			}}
		>
			{BluetoothWidget(Bluetooth)}
		</button>
	);
}
