import { Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, execAsync, exec, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import Pango from "gi://Pango";

function AdapterControls(bluetooth: AstalBluetooth.Bluetooth, adapter: AstalBluetooth.Adapter) {
	function Buttons({ action, ...props }: { action: "blueman" | "refresh" | "power" } & Widget.ButtonProps) {
		const Bindings = Variable.derive([bind(bluetooth, "is_powered"), bind(adapter, "discovering")], (is_powered, discovering) => ({
			tooltip: {
				power: is_powered ? "Turn off Bluetooth" : "Turn on Bluetooth",
				refresh: discovering ? "Scanning..." : "Refresh",
				blueman: "Blueman",
			}[action],

			className: {
				power: is_powered ? "bluetooth power-on" : "bluetooth power-off",
				refresh: discovering ? "spinner" : "refresh",
				blueman: "bluetooth blueman",
			}[action],

			command: {
				power: () => {
					adapter.set_powered(is_powered ? false : true);
				}, //execAsync("bluetoothctl power off") : execAsync("bluetoothctl power on"),
				refresh: () => {
					discovering ? adapter.stop_discovery() : [adapter.start_discovery(), setTimeout(() => adapter.stop_discovery(), 60000)];
				},
				blueman: () => {
					execAsync("blueman-manager");
					App.toggle_window(`dashboard${App.get_monitors()[0]}`);
				},
			}[action],

			icon: {
				power: is_powered ? Icon.bluetooth.enabled : Icon.bluetooth.disabled,
				refresh: discovering ? "process-working-symbolic" : "view-refresh-symbolic",
				blueman: Icon.ui.settings,
			}[action],
		}))();

		return (
			<button
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						Bindings.get().command();
					}
				}}
				className={Bindings.as((c) => c.className)}
				halign={CENTER}
				valign={CENTER}
				tooltip_text={Bindings.as((t) => t.tooltip)}
				{...props}
			>
				<icon icon={Bindings.as((i) => i.icon)} halign={CENTER} valign={CENTER} />
			</button>
		);
	}
	return (
		<box className={"bluetooth devicelist-header controls"} halign={CENTER} valign={CENTER} spacing={15}>
			<Buttons action={"power"} />
			<Buttons action={"refresh"} />
			<Buttons action={"blueman"} />
		</box>
	);
}

function content(device: AstalBluetooth.Device) {
	const DeviceButton = () => {
		const btDeviceLabel = <label label={device.name} halign={START} valign={CENTER} ellipsize={Pango.EllipsizeMode.END} tooltip_text={device.address || "No Address"} />;

		const DeviceTypeIcon = <icon icon={device.icon || "bluetooth-symbolic"} halign={START} valign={CENTER} />;

		return (
			<button halign={FILL} valign={CENTER} onClick={() => execAsync(`bluetoothctl ${device.connected ? "disconnect" : "connect"} ${device.address}`)}>
				<centerbox halign={START} valign={CENTER} spacing={5} startWidget={DeviceTypeIcon} centerWidget={btDeviceLabel} />
			</button>
		);
	};

	const DeviceControls = ({ action, ...props }: { action: "pair" | "trust" | "connect" } & Widget.ButtonProps) => {
		const Bindings = Variable.derive([bind(device, "paired"), bind(device, "trusted"), bind(device, "connected")], (paired, trusted, connected) => ({
			command: {
				// ctl commands
				pair: () => {
					execAsync(`bluetoothctl ${paired ? "remove" : "pair"} ${device.address}`);
				},
				trust: () => {
					execAsync(`bluetoothctl ${trusted ? "untrust" : "trust"} ${device.address}`);
				},
				connect: () => {
					execAsync(`bluetoothctl ${connected ? "disconnect" : "connect"} ${device.address}`);
				},

				// astal commands
				// pair: () => paired ? "" : device.pair(),
				// trust: () => device.set_trusted(trusted ? false : true),
				// connect: () => connected ? device.disconnect_device() : device.connect_device(),
			}[action],

			icon: {
				pair: paired ? "bluetooth-link-symbolic" : "bluetooth-unlink-symbolic",
				trust: trusted ? "bluetooth-trust-symbolic" : "bluetooth-untrust-symbolic",
				connect: connected ? "bluetooth-connect-symbolic" : "bluetooth-disconnect-symbolic",
			}[action],

			tooltip: {
				pair: paired ? "Unpair" : "Pair",
				trust: trusted ? "Untrust" : "Trust",
				connect: connected ? "Disconnect" : "Connect",
			}[action],

			classname: {
				pair: `bluetooth devicelist - inner controls ${paired ? "unpair" : "pair"} `,
				trust: `bluetooth devicelist - inner controls ${trusted ? "untrust" : "trust"} `,
				connect: `bluetooth devicelist - inner controls ${connected ? "disconnect" : "connect"} `,
			}[action],

			visible: {
				pair: true,
				trust: paired && connected,
				connect: true,
			}[action],
		}))();

		return (
			<button
				className={Bindings.as((c) => c.classname)}
				visible={Bindings.as((v) => v.visible)}
				onButtonPressEvent={Bindings.get().command}
				halign={END}
				valign={FILL}
				tooltip_markup={Bindings.as((t) => t.tooltip)}
				{...props}
				onDestroy={(self) => {
					self.destroy();
				}}
			>
				<icon icon={Bindings.as((i) => i.icon)} />
			</button>
		);
	};

	return (
		<box className={`bluetooth devicelist - inner items ${device.connected ? "connected" : ""} `} halign={FILL} valign={FILL} visible={true} vertical={true}>
			<centerbox
				vertical={false}
				halign={FILL}
				valign={CENTER}
				startWidget={DeviceButton()}
				endWidget={
					<box className={"bluetooth devicelist-inner controls"} halign={END} valign={FILL} spacing={5}>
						<DeviceControls action="pair" />
						<DeviceControls action="trust" />
						<DeviceControls action="connect" />
					</box>
				}
			/>
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
				endWidget={AdapterControls(Bluetooth, Adapter)}
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
