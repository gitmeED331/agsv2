/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk } from "astal/gtk3";
import { VolumeIndicator, BatteryButton, NetworkButton, BluetoothButton } from "../../Widgets/index";

export default function SysInfo() {
	return (
		<box className={"sysinfo"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={5}>
			<VolumeIndicator />
			<NetworkButton />
			<BluetoothButton />
			<BatteryButton />
		</box>
	);
}
