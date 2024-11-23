/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, Variable } from "astal";
import Pango from "gi://Pango";
import Icon, { Icons } from "../../../lib/icons";
import AstalHyprland from "gi://AstalHyprland";

function AppTitleTicker() {
	const hyprland = AstalHyprland.get_default();

	const focusedIcon = Variable<string>("");
	const focusedTitle = Variable<string>("");

	const appIcon = (
		<icon
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
			icon={bind(focusedIcon)}
		// icon={bind(hyprland, "focusedClient").as((client) => Icons(client.get_class()))}
		/>
	);

	const appTitle = (
		<label
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
			hexpand={true}
			ellipsize={Pango.EllipsizeMode.END}
			useMarkup={true}
			label={bind(focusedTitle)}
		// label={bind(hyprland, "focusedClient").as((client) => client.get_title())}
		/>
	);

	function updateAppInfo() {
		const updateApp = (client: AstalHyprland.Client | null | undefined = hyprland.get_focused_client()) => {
			if (client) {
				appIcon.visible = true;
				focusedIcon.set(Icons(client.get_class()) || client.get_class());
				focusedTitle.set(client.get_title() || client.get_class() || "Unknown App");
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
			className={"AppTitleTicker"}
			// visible={bind(focusedTitle).as(i => i !== "" ? true : false)}
			visible={true}
			onClick={(_, event) => {
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

// /**
//  * MIT License
//  *
//  * Copyright (c) 2024 TopsyKrets
//  *
//  * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
//  *
//  */

// import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
// import { bind, Variable } from "astal";
// import Pango from "gi://Pango";
// import Icon, { Icons } from "../../../lib/icons";
// import AstalHyprland from "gi://AstalHyprland";

// function AppTitleTicker() {
// 	const hyprland = AstalHyprland.get_default();
// 	const focusedIcon = Variable<string>("");
// 	const focusedTitle = Variable<string>("");

// 	const appIcon = (
// 		<icon
// 			valign={Gtk.Align.CENTER}
// 			halign={Gtk.Align.CENTER}
// 			icon={bind(focusedIcon)}
// 		// icon={bind(hyprland, "focusedClient").as((client) => client?.get_class())}
// 		/>
// 	);

// 	const appTitle = (
// 		<label
// 			valign={Gtk.Align.CENTER}
// 			halign={Gtk.Align.CENTER}
// 			hexpand={true}
// 			ellipsize={Pango.EllipsizeMode.END}
// 			useMarkup={true}
// 			label={bind(focusedTitle)}
// 		// label={bind(hyprland, "focusedClient").as((client) => client?.get_title() || client?.get_class())}
// 		/>
// 	);

// 	function updateAppInfo() {
// 		const updateApp = (client: AstalHyprland.Client | null | undefined = hyprland.get_focused_client()) => {
// 			if (client) {
// 				const className = Icons(client.get_class()) || client.get_class();
// 				const title = client.get_title() || className;

// 				console.log("Client Class:", className);
// 				console.log("Client Title:", title);

// 				appIcon.visible = true;
// 				focusedIcon.set(className || "fallback-icon");
// 				focusedTitle.set(title);
// 			} else {
// 				appIcon.visible = false;
// 				focusedTitle.set("Desktop");
// 			}
// 		};

// 		const updateFocusedClient = () => updateApp(hyprland.focusedClient);
// 		const updateActiveWindow = () => updateApp(hyprland.get_client(JSON.parse(hyprland.message("j/activewindow")).address));

// 		hyprland.connect("notify::focused-client", updateFocusedClient);
// 		hyprland.connect("client-removed", updateFocusedClient);
// 		hyprland.connect("client-added", updateActiveWindow);

// 		updateFocusedClient();
// 	}

// 	updateAppInfo();

// 	return (
// 		<button
// 			className={"AppTitleTicker"}
// 			// visible={bind(focusedTitle).as(i => i !== "" ? true : false)}
// 			visible={true}
// 			onClick={(_, event) => {
// 				const win = App.get_window("overview");
// 				switch (event.button) {
// 					case Gdk.BUTTON_PRIMARY:
// 						if (win) {
// 							win.visible = !win.visible;
// 						}
// 						break;
// 					case Gdk.BUTTON_SECONDARY:
// 						hyprland.focusedClient.kill();
// 						break;
// 					case Gdk.BUTTON_MIDDLE:
// 						break;
// 					default:
// 						break;
// 				}
// 			}}
// 		>
// 			<box spacing={5}>{[appIcon, appTitle]}</box>
// 		</button>
// 	);
// }

// export default AppTitleTicker;

