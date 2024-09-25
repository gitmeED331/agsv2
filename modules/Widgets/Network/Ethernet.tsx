import { bind, Gdk, Gtk, Widget, App, Astal, Variable, Binding } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import NM from "gi://NM";

const network = AstalNetwork.get_default();
const Wired = network.wired;

function header() {
	const ethernetIcon = <icon icon={bind(Wired, "icon_name")} />;

	const ethernetLabel = <label label={"Ethernet"} />;

	return (
		<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} vertical={false} spacing={5}>
			{[ethernetIcon, ethernetLabel]}
		</box>
	);
}
const status = (
	<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={5}>
		<label
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
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
		/>
	</box>
);

function EthernetWidget() {
	return (
		<box className={"network ethernet container"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} vertical={false} spacing={5}>
			{[header(), status]}
		</box>
	);
}

export default EthernetWidget;
