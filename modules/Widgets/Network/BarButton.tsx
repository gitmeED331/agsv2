/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { bind, Variable, execAsync } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import { dashboardRightStack } from "../../Windows/dashboard/RightSide";

const network = AstalNetwork.get_default();
const Wired = network.wired;
const Wifi = network.wifi;

let netreveal = Variable(false);

const NetworkWidget = () => {
	const wifiIcon = <icon className={"barbutton wifi icon"} icon={bind(Wifi, "icon_name")} />;

	const wifiLabel = <label className={"barbutton wifi label"} />;

	function updateWifiLabel() {
		const wifi = network.wifi;
		wifiLabel.set_label(wifi.ssid ? `${wifi.ssid.substring(0, 15)}` : "--");
	}

	updateWifiLabel();

	network.connect("notify::wifi", updateWifiLabel);

	const wifiLabelRevealer = (
		<revealer transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT} clickThrough={true} reveal_child={bind(netreveal)}>
			{wifiLabel}
		</revealer>
	);
	const wifiIndicator = (
		<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} visible={bind(network, "wifi").as((showLabel) => !!showLabel)}>
			{[wifiIcon, wifiLabelRevealer]}
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
					const dashTab = "network";
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
					netreveal.set(!netreveal.get());
				}
			}}
		>
			<NetworkWidget />
		</button>
	);
}

export default NetworkButton;
