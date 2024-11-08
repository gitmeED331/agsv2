/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { execAsync, GLib } from "astal";
import Icon, { Icons } from "../lib/icons.js";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

const SysButton = (action: string, label: string) => {
	const command = (() => {
		switch (action) {
			case "lock":
				return `ags -c ${SRC}/Lockscreen/`;
			case "reboot":
				return "systemctl reboot";
			case "logout":
				if (wm === "hyprland") {
					return "hyprctl dispatch exit";
				}
				if (wm === "river") {
					return "riverctl exit";
				}
			case "shutdown":
				return "systemctl -i poweroff";
			default:
				return "";
		}
	})();

	return (
		<button
			onClicked={(_, event) => {
				const win = App.get_window("sessioncontrols");
				if (event.button === Gdk.BUTTON_PRIMARY) {
					App.toggle_window("sessioncontrols");
					execAsync(command);
				}
			}}
			onKeyPressed={(_, event) => {
				const win = App.get_window("sessioncontrols");
				if (event.get_keyval() === Gdk.KEY_Return) {
					App.toggle_window("sessioncontrols");
					execAsync(command);
				}
			}}
			canFocus={true}
			hasDefault={false}
		>
			<box cssClasses={"sessioncontrol button"} vertical={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
				<icon icon={Icon.powermenu[action]} />
				<label label={label} />
			</box>
		</button>
	);
};

function SessionControls() {
	return (
		<box cssClasses={"sessioncontrols container"} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} visible={true}>
			{SysButton("lock", "Lock")}
			{SysButton("logout", "Log Out")}
			{SysButton("reboot", "Reboot")}
			{SysButton("shutdown", "Shutdown")}
		</box>
	);
}
export default SessionControls;
