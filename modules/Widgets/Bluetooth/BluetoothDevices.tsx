import { Gtk, Gdk, App } from "astal/gtk3";
import { bind, execAsync, exec, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import Pango from "gi://Pango";
import Spinner from "../../Astalified/Spinner";
import { addressOf } from "system";

function btControls(bluetooth: AstalBluetooth.Bluetooth, adapter: AstalBluetooth.Adapter) {
	const btPower = (
		<button
			className={bind(bluetooth, "is_powered").as((v) => `bluetooth ${v ? "power-on" : "power-off"}`)}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					execAsync(`bluetoothctl power ${bluetooth.is_powered ? "off" : "on"}`);
				}
			}}
			halign={END}
			valign={CENTER}
			tooltip_text={bind(bluetooth, "is_powered").as((v) => `Power ${v ? "off" : "on"}`)}
		>
			<icon icon={bind(bluetooth, "is_powered").as((v) => (v ? Icon.bluetooth.enabled : Icon.bluetooth.disabled))} halign={END} valign={CENTER} />
		</button>
	);

	const Refresh = (
		<stack visible={true} halign={END} visible_child_name={bind(adapter, "discovering").as((d) => (d ? "spinnerbtn" : "iconbtn"))} homogeneous={false}>
			<button
				name={"iconbtn"}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						//execAsync(`bluetoothctl --timeout 120 scan on`)
						adapter.start_discovery();
						setTimeout(() => {
							adapter.stop_discovery();
						}, 120000);
					}
				}}
				halign={CENTER}
				valign={CENTER}
				tooltip_text={"Start Discovery"}
			>
				<icon icon={"view-refresh-symbolic"} halign={CENTER} valign={CENTER} />
			</button>
			<button
				name="spinnerbtn"
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						//execAsync("bluetoothctl scan off")
						adapter.stop_discovery();
					}
				}}
				halign={CENTER}
				valign={CENTER}
				tooltip_text={"Stop Discovery"}
			>
				<Spinner halign={CENTER} valign={CENTER}
					setup={(spinner) => {
						bind(adapter, "discovering").as((s) => (s === true ? spinner.start : spinner.stop))
					}}
				/>
			</button>
		</stack>
	);
	const blueman = (
		<button
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					execAsync("blueman-manager");
					App.toggle_window("dashboard");
				}
			}}
			halign={END}
			valign={CENTER}
			tooltip_text={"Blueman Manager"}
		>
			<icon icon={Icon.ui.settings} halign={END} valign={CENTER} />
		</button>
	);
	return (
		<box className={"bluetooth devicelist-header controls"} halign={CENTER} valign={CENTER} spacing={15}>
			{[btPower, Refresh, blueman]}
		</box>
	);
}

function content(device: AstalBluetooth.Device) {
	const adapter = AstalBluetooth.Adapter

	const DeviceButton = () => {
		const btDeviceLabel = <label label={device.name} halign={START} valign={CENTER} ellipsize={Pango.EllipsizeMode.END} tooltip_text={device.address || "No Address"} />;

		const DeviceTypeIcon = <icon icon={device.icon || "bluetooth-symbolic"} halign={START} valign={CENTER} />;

		return (
			<button halign={FILL} valign={CENTER} onClick={() => execAsync(`bluetoothctl ${device.connected ? "disconnect" : "connect"} ${device.address}`)}>
				<centerbox halign={START} valign={CENTER} spacing={5} startWidget={DeviceTypeIcon} centerWidget={btDeviceLabel} />
			</button>
		);
	};
	const btDeviceControls = (action: string) => {

		// const command = Variable.derive([bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")], (paired, trusted, connected) => {
		// 	switch (action) {
		// 		// case "pair": return `bluetoothctl ${device.paired === true ? "Unpair" : "Pair"} ${device.address}`;
		// 		// case "trust": return `bluetoothctl ${device.trusted ? "untrust" : "trust"} ${device.address}`;
		// 		// case "connect": return `bluetoothctl ${device.connected ? "disconnect" : "connect"} ${device.address}`;
		// 		// case "forget": return `bluetoothctl remove ${device.address}`;
		// 		case "pair": return paired ? adapter.remove_device(device) : device.pair;
		// 		case "trust": return device.set_trusted(trusted ? false : true);
		// 		case "connect": return connected ? device.disconnect_device : device.connect_device;
		// 		default: return "";
		// 	}
		// })();
		// const icon = Variable.derive([bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")], (paired, trusted, connected) => {
		// 	switch (action) {
		// 		case "pair": return paired ? "bluetooth-link-symbolic" : "bluetooth-unlink-symbolic";
		// 		case "trust": return trusted ? "bluetooth-trust-symbolic" : "bluetooth-untrust-symbolic";
		// 		case "connect": return connected ? "bluetooth-connect-symbolic" : "bluetooth-disconnect-symbolic";
		// 		case "forget": return "circle-x-symbolic"
		// 		default: return "bluetooth-symbolic";
		// 	}
		// })();
		// const tooltip = Variable.derive([bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")], (paired, trusted, connected) => {
		// 	switch (action) {
		// 		case "pair": return paired ? "Unpair" : "Pair";
		// 		case "trust": return trusted ? "Untrust" : "Trust";
		// 		case "connect": return connected ? "Disconnect" : "Connect";
		// 		case "forget": return "Forget";
		// 		default: return "";
		// 	}
		// })();
		// const classname = Variable.derive([bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")], (paired, trusted, connected) => {
		// 	switch (action) {
		// 		case "pair": return paired ? "bluetooth devicelist-inner controls unpair" : "bluetooth devicelist-inner controls pair";
		// 		case "trust": return trusted ? "bluetooth devicelist-inner controls untrust" : "bluetooth devicelist-inner controls trust";
		// 		case "connect":	return connected ? "bluetooth devicelist-inner controls disconnect" : "bluetooth devicelist-inner controls connect";
		// 		case "forget":	return "bluetooth devicelist-inner controls forget";
		// 		default: return "";
		// 	}
		// })();
		// const visible = Variable.derive([bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")], (paired, trusted, connected) => {
		// 	switch (action) {
		// 		case "pair": return true;
		// 		case "trust": return paired && connected;
		// 		case "connect":	return true;
		// 		case "forget": return paired;
		// 		default: return false;
		// 	}
		// })();

		// return <button
		// 	className={classname}
		// 	visible={visible}
		// 	onClicked={() => command}
		// 	halign={END} valign={FILL}
		// 	tooltip_markup={tooltip}
		// >
		// 	<icon icon={icon} />
		// </button >

		const command = Variable.derive(
			[bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")],
			(paired, trusted, connected) => {
				const actionMap: {
					[key: string]: any
				} = {
					// ctl commands
					pair: `bluetoothctl ${paired ? "Unpair" : "Pair"} ${device.address}`,
					trust: `bluetoothctl ${trusted ? "untrust" : "trust"} ${device.address}`,
					connect: `bluetoothctl ${connected ? "disconnect" : "connect"} ${device.address}`,
					forget: `bluetoothctl remove ${device.address}`,

					// astal commands
					// pair: paired ? (adapter as any).remove_device(device) : device.pair(),
					// trust: trusted ? device.set_trusted(false) : device.set_trusted(true),
					// connect: connected ? device.disconnect_device.begin() : device.connect_device.begin(),
				};
				return actionMap[action] || "";
			}
		)();

		const icon = Variable.derive(
			[bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")],
			(paired, trusted, connected) => {
				const iconMap: { [key: string]: string } = {
					pair: paired ? "bluetooth-link-symbolic" : "bluetooth-unlink-symbolic",
					trust: trusted ? "bluetooth-trust-symbolic" : "bluetooth-untrust-symbolic",
					connect: connected ? "bluetooth-connect-symbolic" : "bluetooth-disconnect-symbolic",
					forget: "circle-x-symbolic",
				};
				return iconMap[action] || "";
			}
		)();

		const tooltip = Variable.derive(
			[bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")],
			(paired, trusted, connected) => {
				const tooltipMap: { [key: string]: string } = {
					pair: paired ? "Unpair" : "Pair",
					trust: trusted ? "Untrust" : "Trust",
					connect: connected ? "Disconnect" : "Connect",
					forget: "Forget",
				};
				return tooltipMap[action] || "";
			}
		)();

		const classname = Variable.derive(
			[bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")],
			(paired, trusted, connected) => {
				const classnameMap: { [key: string]: string } = {
					pair: `bluetooth devicelist - inner controls ${paired ? "unpair" : "pair"} `,
					trust: `bluetooth devicelist - inner controls ${trusted ? "untrust" : "trust"} `,
					connect: `bluetooth devicelist - inner controls ${connected ? "disconnect" : "connect"} `,
					forget: "bluetooth devicelist-inner controls forget",
				};
				return classnameMap[action] || "";
			}
		)();

		const visible = Variable.derive(
			[bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")],
			(paired, trusted, connected) => {
				const visibleMap: { [key: string]: boolean } = {
					pair: true,
					trust: paired && connected,
					connect: true,
					forget: paired,
				};
				return visibleMap[action] || false;
			}
		)();

		return (
			<button
				className={classname}
				visible={visible}
				onClick={(_, event) => { if (event.button === Gdk.BUTTON_PRIMARY) { command } }}
				halign={END}
				valign={FILL}
				tooltip_markup={tooltip}
			>
				<icon icon={icon} />
			</button >
		);
	}
	return (
		<box className={`bluetooth devicelist - inner items ${device.connected ? "connected" : ""} `} halign={FILL} valign={FILL} visible={true} vertical={true}>
			<centerbox vertical={false} halign={FILL} valign={CENTER}
				startWidget={DeviceButton()}
				endWidget={
					<box className={"bluetooth devicelist-inner controls"} halign={END} valign={FILL} spacing={5}>
						{[btDeviceControls("pair"), btDeviceControls("trust"), btDeviceControls("connect"), btDeviceControls("forget")]}
					</box>} />
		</box>
	);
}

function BluetoothDevices() {
	const Bluetooth = AstalBluetooth.get_default();
	const Adapter = Bluetooth.adapter;

	const btdevicelist = bind(Bluetooth, "devices").as((devices) => {
		const availableDevices = devices
			.filter((btDev) => {
				const name = btDev.name ? btDev.name.trim() : null;
				return name && name !== "Unknown Device" && name !== "";
			})
			.sort((a, b) => {
				if (a.connected && !b.connected) return -1;
				if (!a.connected && b.connected) return 1;
				if (a.paired && !b.paired) return -1;
				if (!a.paired && b.paired) return 1;
				return a.name.localeCompare(b.name);
			});

		return availableDevices.map((device) => content(device));
	});

	return (
		<box className={"bluetooth container"} name={"Bluetooth"} halign={FILL} valign={FILL} visible={true} vertical={true} spacing={10}>
			<centerbox
				className={"bluetooth devicelist-header"}
				vertical={false}
				halign={FILL}
				valign={CENTER}
				centerWidget={<label label={"Bluetooth"} />}
				endWidget={btControls(Bluetooth, Adapter)}
			/>
			<scrollable halign={FILL} valign={FILL} visible={true} vscroll={Gtk.PolicyType.AUTOMATIC} hscroll={Gtk.PolicyType.NEVER} expand>
				<box className={"bluetooth devicelist-inner"} halign={FILL} valign={FILL} visible={true} vertical={true} spacing={5}>
					{btdevicelist}
				</box>
			</scrollable>
		</box>
	);
}

export default BluetoothDevices;
