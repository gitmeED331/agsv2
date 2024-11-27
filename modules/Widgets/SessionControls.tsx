import { Gdk, App } from "astal/gtk3";
import { execAsync, GLib } from "astal";
import Icon, { Icons } from "../lib/icons.js";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

const SysButton = (action: string, label: string) => {
	const command = (() => {
		switch (action) {
			case "lock":
				return `ags run -d ${SRC}/Lockscreen/`;
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
			onClick={(_, event) => {
				const win = App.get_window("sessioncontrols");
				if (event.button === Gdk.BUTTON_PRIMARY) {
					App.toggle_window("sessioncontrols");
					execAsync(command);
				}
			}}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window("sessioncontrols");
				if (event.get_keyval()[1] === Gdk.KEY_Return) {
					App.toggle_window("sessioncontrols");
					execAsync(command);
				}
			}}
			canFocus={true}
			hasDefault={false}
		>
			<box className={"sessioncontrol button"} vertical={true} halign={CENTER} valign={CENTER}>
				<icon icon={Icon.powermenu[action as "lock" | "logout" | "reboot" | "shutdown"]} />
				<label label={label} />
			</box>
		</button>
	);
};

export default function SessionControls() {
	return (
		<box className={"sessioncontrols container"} valign={CENTER} halign={CENTER} visible={true}>
			{SysButton("lock", "Lock")}
			{SysButton("logout", "Log Out")}
			{SysButton("reboot", "Reboot")}
			{SysButton("shutdown", "Shutdown")}
		</box>
	);
}
