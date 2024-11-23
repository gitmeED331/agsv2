/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { Variable, bind } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import { dashboardRightStack } from "../../Windows/dashboard/RightSide";

let btreveal = Variable(false);

const BluetoothWidget = (bluetooth) => {
	const updateLabel = (btLabel: any) => {
		const btEnabled = bluetooth.is_powered;
		const btDevices = bluetooth.is_connected;
		const label = btEnabled ? (btDevices ? ` (${btDevices})` : "On") : "Off";
		btLabel.label = label;
	};

	bluetooth.connect("notify::enabled", updateLabel);
	bluetooth.connect("notify::connected_devices", updateLabel);

	return (
		<box className={"bluetooth barbutton content"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} visible={true}>
			{bind(bluetooth, "is_powered").as((showLabel) => (
				<box>
					<icon className={"bluetooth barbutton-icon"} icon={bind(bluetooth, "is_powered").as((v) => (v ? Icon.bluetooth.enabled : Icon.bluetooth.disabled))} />
					<revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} clickThrough={true} reveal_child={bind(btreveal)}>
						<label className={"bluetooth barbutton-label"} setup={updateLabel} />
					</revealer>
				</box>
			))}
		</box>
	);
};
export default function BluetoothButton() {
	const Bluetooth = AstalBluetooth.get_default();

	return (
		<button
			className={"bluetooth barbutton"}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const dashTab = "bluetooth";
					const win = App.get_window("dashboard");
					const dashboardTab = dashboardRightStack.get_visible_child_name() === dashTab;
					const setDashboardTab = dashboardRightStack.set_visible_child_name(dashTab);
					if (win) {
						if (win.visible === true && !dashboardTab) {
							setDashboardTab;
						} else if (win.visible === true && dashboardTab) {
							win.visible = !win.visible;
						} else {
							win.visible = !win.visible;
						}
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					btreveal.set(!btreveal.get());
				}
			}}
		>
			{BluetoothWidget(Bluetooth)}
		</button>
	);
}
