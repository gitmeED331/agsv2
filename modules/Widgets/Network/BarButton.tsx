import { Gtk, Gdk, App } from "astal/gtk3";
import { bind, Variable } from "astal";
import AstalNetwork from "gi://AstalNetwork";
import { dashboardRightStack } from "../../Windows/dashboard/RightSide";

let netreveal = Variable(false);

function NetworkWidget({ network }: { network: AstalNetwork.Network }) {

	const Bindings = Variable.derive(
		[bind(network, "primary"), bind(network, "wired"), bind(network, "wifi")],
		(primary, wired, wifi) => {
			switch (primary) {
				case AstalNetwork.Primary.WIFI:
					return {
						icon: wifi.icon_name,
						label: "Wifi",
						tooltip: `Connectd to: \n <b>${wifi.ssid}</b>`,
					};
				case AstalNetwork.Primary.WIRED:
					return {
						icon: wired.icon_name,
						label: "Wired",
						tooltip: `Connected to:\n <b>Ethernet</b>`,
					};
				default:
					return {
						icon: "network-disconnected-symbolic",
						label: "Disconnected",
						tooltip: "No connection",
					};
			}
		}
	);

	return <box tooltipMarkup={bind(Bindings).as((t) => t.tooltip)} spacing={5} >
		<icon icon={bind(Bindings).as((i) => i.icon)} />
		<revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} clickThrough={true} reveal_child={bind(netreveal)}>
			<label label={bind(Bindings).as((l) => l.label)} />
		</revealer>
	</box>
}

function NetworkButton() {
	const Network = AstalNetwork.get_default();

	return (
		<button
			className={"network barbutton"}
			halign={CENTER}
			valign={CENTER}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const dashTab = "network";
					const win = App.get_window(`dashboard${App.get_monitors()[0].get_model()}`);
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
					netreveal.set(!netreveal.get());
				}
			}}
		>
			<NetworkWidget network={Network} />
		</button>
	);
}

export default NetworkButton;
