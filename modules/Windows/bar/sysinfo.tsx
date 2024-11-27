import { VolumeIndicator, BatteryButton, NetworkButton, BluetoothButton } from "../../Widgets/index";

export default function SysInfo() {
	return (
		<box className={"sysinfo"} halign={CENTER} valign={CENTER} spacing={5}>
			<VolumeIndicator />
			<NetworkButton />
			<BluetoothButton />
			<BatteryButton />
		</box>
	);
}
