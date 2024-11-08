/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, Variable } from "astal";
import Pango from "gi://Pango";
import Icon from "../../../lib/icons";
import AstalHyprland from "gi://AstalHyprland";

const hyprland = AstalHyprland.get_default();

function AppTitleTicker() {
	const focusedIcon = Variable<string>("");
	const focusedTitle = Variable<string>("");

	const appIcon = <icon valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} icon={bind(focusedIcon)} />;

	const appTitle = <label valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} ellipsize={Pango.EllipsizeMode.END} useMarkup={true} label={bind(focusedTitle)} />;

	function updateAppInfo() {
		const updateApp = (client: AstalHyprland.Client | null | undefined = hyprland.get_focused_client()) => {
			if (client) {
				appIcon.visible = true;
				focusedIcon.set(client.get_class());
				focusedTitle.set(client.get_title() || client.get_class());
			} else {
				appIcon.visible = false;
				focusedTitle.set("Desktop");
			}
		};

		hyprland.connect("notify::focused-client", () => updateApp(hyprland.focusedClient));
		hyprland.connect("client-removed", () => updateApp(hyprland.focusedClient));
		hyprland.connect("client-added", () => {
			updateApp(hyprland.get_client(JSON.parse(hyprland.message("j/activewindow")).address));
		});

		updateApp(hyprland.focusedClient);
	}

	updateAppInfo();

	return (
		<button
			cssClasses={"AppTitleTicker"}
			visible={bind(focusedTitle).as((i) => (i !== "" ? true : false))}
			onClicked={(_, event) => {
				const win = App.get_window("overview");
				switch (event.button) {
					case Gdk.BUTTON_PRIMARY:
						if (win) {
							win.visible = !win.visible;
						}
						break;
					case Gdk.BUTTON_SECONDARY:
						hyprland.focusedClient.kill();
						break;
					case Gdk.BUTTON_MIDDLE:
						break;
					default:
						break;
				}
			}}
		>
			<box spacing={5}>{[appIcon, appTitle]}</box>
		</button>
	);
}

export default AppTitleTicker;
