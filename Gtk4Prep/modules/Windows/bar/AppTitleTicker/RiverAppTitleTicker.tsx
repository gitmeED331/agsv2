/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, GLib, execAsync } from "astal";
import Pango from "gi://Pango";
import AstalRiver from "gi://AstalRiver";

const river = AstalRiver.get_default()!;

function AppTitleTicker() {
	return (
		<button
			cssClasses={"AppTitleTicker"}
			onClicked={(_, event) => {
				const win = App.get_window("overview");
				switch (event.button) {
					case Gdk.BUTTON_PRIMARY:
						if (win) {
							win.visible = !win.visible;
						}
						break;
					case Gdk.BUTTON_SECONDARY:
						execAsync(`riverctl focus-view close`);
						break;
					case Gdk.BUTTON_MIDDLE:
						break; // TODO: Implement middle click behavior
					default:
						break;
				}
			}}
		>
			<box spacing={5}>
				<label valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} ellipsize={Pango.EllipsizeMode.END} label={bind(river, "focused_view").as((v) => v || "Desktop")} />
			</box>
		</button>
	);
}

export default AppTitleTicker;
