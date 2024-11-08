/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { Variable, bind } from "astal";
import { dashboardLeftStack } from "../dashboard/LeftSide";
import { dashboardRightStack } from "../dashboard/RightSide";

export default function Clock() {
	const time = Variable("").poll(1000, 'date "+%H:%M:%S"');
	const date = Variable("").poll(3600000, 'date "+%a %b %d"');
	return (
		<button
			cssClasses="clock"
			cursor="pointer"
			onClicked={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const win = App.get_window("dashboard");
					if (win) {
						win.visible = !win.visible;
					}
				}
				// Additional click actions for other buttons can be added here if needed
			}}
		>
			<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={5}>
				<label label={bind(date)} />
				<icon icon="nix-snowflake-symbolic" />
				<label label={bind(time)} />
			</box>
		</button>
	);
}
