import { Astal, Gtk } from "astal/gtk3";
import { VolumeIndicator, BatteryButton, NetworkButton, BluetoothButton } from "../../Widgets/index";

export default function SysInfo() {
	return (
		<box className={"sysinfo"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={5}>
			<VolumeIndicator />
			<NetworkButton />
			<BluetoothButton />
			<BatteryButton />
		</box>
	);
}
