import { Gtk, Gdk, App } from "astal/gtk3";
import { bind, Variable } from "astal";
import AstalNetwork from "gi://AstalNetwork";
import { dashboardRightStack } from "../../Windows/dashboard/RightSide";

let netreveal = Variable(false);

function NetworkWidget({ network }: any) {

	const icon = Variable.derive([bind(network, "primary"), bind(network, "wired"), bind(network, "wifi")], (primary, wired, wifi) => {
		switch (primary) {
			case AstalNetwork.Primary.WIFI:
				return wifi.icon_name
			case AstalNetwork.Primary.WIRED:
				return wired.icon_name
			default:
				return "network-disconnected-symbolic"
		}
	})

	const label = Variable.derive([bind(network, "primary"), bind(network, "wired"), bind(network, "wifi")], (primary, wired, wifi) => {
		switch (primary) {
			case AstalNetwork.Primary.WIFI:
				return "Wifi"
			case AstalNetwork.Primary.WIRED:
				return "Wired"
			default:
				return "Disconnected"
		}
	});

	const tooltip = Variable.derive([bind(network, "primary"), bind(network, "wired"), bind(network, "wifi")], (primary, wired, wifi) => {
		switch (primary) {
			case AstalNetwork.Primary.WIFI:
				return `Connectd to: \n <b>${wifi.ssid}</b>`
			case AstalNetwork.Primary.WIRED:
				return `Connected to:\n <b>Ethernet</b>`
			default:
				return "No connection"
		}
	})

	return <box tooltipMarkup={bind(tooltip)} >
		<icon icon={bind(icon)} />
		<revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} clickThrough={true} reveal_child={bind(netreveal)}>
			<label label={bind(label)} />
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
					const win = App.get_window("dashboard");
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
