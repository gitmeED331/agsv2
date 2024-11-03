/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Widget, Gtk } from "astal/gtk3";
import { StackSwitcher } from "../../Astalified/index";

// --- imported widgets ---
import { BluetoothDevices, EthernetWidget, WifiAPs } from "../../Widgets/index";
import NotificationList from "./notificationList";

export let dashboardRightStack;
export default function RightSide() {
	const rightStack = new Gtk.Stack({
		transitionType: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
		transitionDuration: 300,
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.FILL,
		hhomogeneous: true,
		vhomogeneous: false,
		visible: true,
		hexpand: false,
		vexpand: true,
	});

	dashboardRightStack = rightStack;

	rightStack.add_titled(NotificationList(), "notifications", "Notifications");
	rightStack.add_titled(
		<box className={"network dashboard"} vertical={true} spacing={5}>
			{[EthernetWidget(), WifiAPs()]}
		</box>,
		"network",
		"Network",
	);
	rightStack.add_titled(BluetoothDevices(), "bluetooth", "Bluetooth");

	function SSsetup(stackSwitcher: StackSwitcher) {
		stackSwitcher.set_stack(rightStack);
	}

	const stackSwitcher = new StackSwitcher({
		className: "dashboard stackSwitcher",
		setup: SSsetup,
		halign: Gtk.Align.CENTER,
		valign: Gtk.Align.START,
		spacing: 10,
	});

	return (
		<box className={"dashboard rightSide"} vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.START} hexpand={true} vexpand={true} spacing={5} heightRequest={500} widthRequest={50}>
			{[stackSwitcher, rightStack]}
		</box>
	);
}
