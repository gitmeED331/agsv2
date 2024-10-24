import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { bind, Variable, Binding } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import { dashboardRightStack } from "../../Windows/dashboard/RightSide";

const network = AstalNetwork.get_default();
const Wired = network.wired;
const Wifi = network.wifi;

let netreveal = Variable(false);

const NetworkWidget = () => {
	const wifiIcon = <icon className={"barbutton wifi icon"} icon={bind(Wifi, "icon_name")} />;

	const wifiLabel = (
		<revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} clickThrough={true} reveal_child={bind(netreveal)}>
			<label
				className={"barbutton wifi label"}
				label={"--"}
			/>
		</revealer>
	);

	const updateWifiLabel = () => {
		const wifi = network.wifi;
		wifiLabel.label = wifi && wifi.ssid ? `${wifi.ssid.substring(0, 7)}` : "--";
	};

	updateWifiLabel();

	network.connect("notify::wifi", updateWifiLabel);

	const wifiIndicator = (
		<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} visible={bind(network, "wifi").as((showLabel) => !!showLabel)}>
			{[wifiIcon, wifiLabel]}
		</box>
	);

	const wiredIcon = <icon className={"barbutton wired icon"} icon={bind(Wired, "icon_name").as((i) => i)} />;

	const wiredLabel = (
		<revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} clickThrough={true} reveal_child={bind(netreveal)}>
			<label className={"network wired label"} label={"Wired"} />
		</revealer>
	);

	const wiredIndicator = (
		<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} visible={bind(network, "wired").as((showLabel) => !!showLabel)}>
			{[wiredIcon, wiredLabel]}
		</box>
	);

	return (
		<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className={"barbutton box"} visible={true}>
			{bind(network, "primary").as((w) => (w === AstalNetwork.Primary.WIRED ? wiredIndicator : wifiIndicator))}
		</box>
	);
};

function NetworkButton() {
	return (
		<button
			className={"network barbutton"}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const dashTab = "network"
					const win = App.get_window("dashboard");
					const dashboardTab = dashboardRightStack.get_visible_child_name() === dashTab;
					const setDashboardTab = dashboardRightStack.set_visible_child_name(dashTab);
					if (win) {
						if (win.visible === true && !dashboardTab) { setDashboardTab }
						else if (win.visible === true && dashboardTab) { win.visible = !win.visible; }
						else { win.visible = !win.visible }
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					netreveal.set(!netreveal.get());
				}
			}}
		>
			<NetworkWidget />
		</button>
	);
}

export default NetworkButton;
