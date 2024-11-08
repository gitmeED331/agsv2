/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, App, Gtk } from "astal/gtk4";
import { execAsync } from "astal";
import { Grid } from "../modules/Astalified/index";
import Icon from "../modules/lib/icons";

function Controls() {
	const SysButton = (action: string) => {
		const command = (() => {
			switch (action) {
				case "reboot":
					return "systemctl reboot";
				case "shutdown":
					return "systemctl -i poweroff";
				default:
					return "";
			}
		})();

		return (
			<button
				onClicked={(_, event) => {
					if (event.button === Gtk.BUTTON_PRIMARY) {
						execAsync(command);
					}
				}}
				onKeyPressEvent={(_, event) => {
					if (event.get_keyval()[1] === Gdk.KEY_Return) {
						execAsync(command);
					}
				}}
				focusable={true}
				hasDefault={false}
			>
				<icon icon={Icon.powermenu[action]} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
			</button>
		);
	};

	const CGrid = new Grid({
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.FILL,
		hexpand: true,
		vexpand: true,
		visible: true,
		columnSpacing: 10,
	});

	CGrid.attach(SysButton("reboot"), 0, 0, 1, 1);
	CGrid.attach(SysButton("shutdown"), 1, 0, 1, 1);

	return (
		<box className="controls" vertical={false} vexpand={true} spacing={5} halign={Gtk.Align.START} valign={Gtk.Align.START} visible={true}>
			{CGrid}
		</box>
	);
}

export default Controls;
