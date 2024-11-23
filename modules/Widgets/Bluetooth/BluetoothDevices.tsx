/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { bind, execAsync, exec, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import Pango from "gi://Pango";
import Spinner from "../../Astalified/Spinner";

function btControls(bluetooth, adapter) {
	const btPower = (
		<button
			className={bind(bluetooth, "is_powered").as((v) => `bluetooth ${v ? "power-on" : "power-off"}`)}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					execAsync(`bluetoothctl power ${bluetooth.is_powered ? "off" : "on"}`);
				}
			}}
			halign={Gtk.Align.END}
			valign={Gtk.Align.CENTER}
			tooltip_text={bind(bluetooth, "is_powered").as((v) => `Power ${v ? "off" : "on"}`)}
		>
			<icon icon={bind(bluetooth, "is_powered").as((v) => (v ? Icon.bluetooth.enabled : Icon.bluetooth.disabled))} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
		</button>
	);

	function spinSetup(spinner: Spinner) {
		bind(adapter, "discovering").as((s) => (s === true ? spinner.start : spinner.stop));
	}

	const Refresh = (
		<stack visible={true} halign={Gtk.Align.END} visible_child_name={bind(adapter, "discovering").as((d) => (d ? "spinnerbtn" : "iconbtn"))} homogeneous={false}>
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
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
				tooltip_text={"Start Discovery"}
			>
				<icon icon={"view-refresh-symbolic"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
			</button>
			<button
				name="spinnerbtn"
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						//execAsync("bluetoothctl scan off")
						adapter.stop_discovery();
					}
				}}
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
				tooltip_text={"Stop Discovery"}
			>
				<Spinner setup={spinSetup} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
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
			halign={Gtk.Align.END}
			valign={Gtk.Align.CENTER}
			tooltip_text={"Blueman Manager"}
		>
			<icon icon={Icon.ui.settings} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
		</button>
	);
	return (
		<box className={"bluetooth devicelist-header controls"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={15}>
			{btPower}
			{Refresh}
			{blueman}
		</box>
	);
}

function content(device) {
	const DeviceButton = () => {
		const btDeviceLabel = <label label={device.name} halign={Gtk.Align.START} valign={Gtk.Align.CENTER} ellipsize={Pango.EllipsizeMode.END} tooltip_text={device.address || "No Address"} />;

		const DeviceTypeIcon = <icon icon={device.icon || "bluetooth-symbolic"} halign={Gtk.Align.START} valign={Gtk.Align.CENTER} />;

		return (
			<button halign={Gtk.Align.FILL} valign={Gtk.Align.CENTER} onClick={() => execAsync(`bluetoothctl ${device.connected ? "disconnect" : "connect"} ${device.address}`)}>
				<centerbox halign={Gtk.Align.START} valign={Gtk.Align.CENTER} spacing={5} startWidget={DeviceTypeIcon} centerWidget={btDeviceLabel} />
			</button>
		);
	};
	const btDeviceControls = () => {
		const PairDevice = (
			<button
				className={"bluetooth devicelist-inner controls pair"}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						exec(`bluetoothctl ${device.paired === true ? "Unpair" : "Pair"} ${device.address}`);
					} else if (event.button === Gdk.BUTTON_SECONDARY) {
						exec(`bluetoothctl cancelpair ${device.address}`);
					}
				}}
				halign={Gtk.Align.END}
				valign={Gtk.Align.CENTER}
				tooltip_text={bind(device, "paired").as((v) => (v ? "Unpair" : "Pair"))}
			>
				<icon icon={bind(device, "paired").as((v) => (v ? "bluetooth-link-symbolic" : "bluetooth-unlink-symbolic"))} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
			</button>
		);
		const TrustDevice = (
			<button
				className={"bluetooth devicelist-inner controls trust"}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						execAsync(`bluetoothctl ${device.trusted ? "untrust" : "trust"} ${device.address}`);
					}
				}}
				halign={Gtk.Align.END}
				valign={Gtk.Align.CENTER}
				tooltip_text={bind(device, "trusted").as((v) => (v ? "Untrust" : "Trust"))}
			>
				<icon icon={bind(device, "trusted").as((v) => (v ? "bluetooth-trust-symbolic" : "bluetooth-untrust-symbolic"))} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
			</button>
		);
		const ConnectDevice = (
			<button
				className={"bluetooth devicelist-inner controls connect"}
				onClicked={async () => await execAsync(`bluetoothctl ${device.connected ? "disconnect" : "connect"} ${device.address}`)}
				halign={Gtk.Align.END}
				valign={Gtk.Align.CENTER}
				tooltip_text={bind(device, "connected").as((v) => (v ? "Disconnect" : "Connect"))}
			>
				<icon icon={bind(device, "connected").as((v) => (v ? "bluetooth-connect-symbolic" : "bluetooth-disconnect-symbolic"))} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
			</button>
		);
		const ForgetDevice = (
			<button
				className={"bluetooth devicelist-inner controls forget"}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						execAsync(`bluetoothctl remove ${device.address}`);
					}
				}}
				visible={device.paired}
				halign={Gtk.Align.END}
				valign={Gtk.Align.CENTER}
				tooltip_text={"Forget"}
			>
				<icon tooltip_text={"Forget"} icon={"circle-x-symbolic"} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
			</button>
		);

		return (
			<box className={"bluetooth devicelist-inner controls"} halign={Gtk.Align.END} valign={Gtk.Align.FILL} spacing={5}>
				{PairDevice}
				{TrustDevice}
				{ConnectDevice}
				{ForgetDevice}
			</box>
		);
	};

	return (
		<box className={`bluetooth devicelist-inner items ${device.connected ? "connected" : ""}`} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} visible={true} vertical={true}>
			<centerbox vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.CENTER} startWidget={DeviceButton()} endWidget={btDeviceControls()} />
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
		<box className={"bluetooth container"} name={"Bluetooth"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} visible={true} vertical={true} spacing={10}>
			<centerbox
				className={"bluetooth devicelist-header"}
				vertical={false}
				halign={Gtk.Align.FILL}
				valign={Gtk.Align.CENTER}
				centerWidget={<label label={"Bluetooth"} />}
				endWidget={btControls(Bluetooth, Adapter)}
			/>
			<scrollable halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} visible={true} vscroll={Gtk.PolicyType.AUTOMATIC} hscroll={Gtk.PolicyType.NEVER} expand>
				<box className={"bluetooth devicelist-inner"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} visible={true} vertical={true} spacing={5}>
					{btdevicelist}
				</box>
			</scrollable>
		</box>
	);
}

export default BluetoothDevices;
