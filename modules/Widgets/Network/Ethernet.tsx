import { bind } from "astal";
import AstalNetwork from "gi://AstalNetwork";
import { networkStats } from "../SystemStats/StatsCalc";

export default function EthernetWidget() {
	const network = AstalNetwork.get_default();
	const Wired = network.wired;

	const ethernetStatus = <label
		label={bind(Wired.device, "state").as((i) => {
			switch (i) {
				case 100:
					return "Connected";
				case 70:
					return "Connecting...";
				case 20:
					return "Disconnected";
				default:
					return "Disconnected";
			}
		})}
	/>
	const ethernetIcon = <icon icon={bind(Wired, "icon_name")} />;

	const ethernetLabel = <label label={"Ethernet"} />;

	return (
		<box className={"network ethernet container"} halign={CENTER} valign={CENTER} vertical spacing={5}>
			<label label={bind(networkStats).as((stats) => `RX: ${stats.rx} | TX: ${stats.tx}`)} />

			<box halign={CENTER} valign={CENTER} spacing={5}>
				{[ethernetIcon, ethernetLabel, ethernetStatus]}
			</box>
		</box>
	);
};

