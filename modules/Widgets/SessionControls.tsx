import { Gdk, App, Widget } from "astal/gtk3";
import { execAsync, GLib, Variable, bind } from "astal";
import Icon, { Icons } from "../lib/icons.js";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

const labelvisible = Variable(true);

export const SysButton = ({ action, ...labelprops }: { action: string } & Widget.LabelProps) => {
	const command = () => {
		const cmd = (() => {
			switch (action) {
				case "lock":
					return `ags run -d ${SRC}/Lockscreen/`;
				case "logout":
					return wm === "hyprland" ? "hyprctl dispatch exit" : wm === "river" ? "riverctl exit" : "";
				case "reboot":
					return "systemctl reboot";
				case "shutdown":
					return "systemctl -i poweroff";
				default:
					return "";
			}
		})();
		return App.toggle_window(`sessioncontrols${App.get_monitors()[0]}`), execAsync(cmd);
	};
	const icon = () => {
		switch (action) {
			case "lock":
				return Icon.powermenu.lock;
			case "logout":
				return Icon.powermenu.logout;
			case "reboot":
				return Icon.powermenu.reboot;
			case "shutdown":
				return Icon.powermenu.shutdown;
			default:
				return "";
		}
	};
	const label = () => {
		switch (action) {
			case "lock":
				return "Lock";
			case "logout":
				return "Log Out";
			case "reboot":
				return "Reboot";
			case "shutdown":
				return "Shutdown";
			default:
				return "";
		}
	};

	const tooltip = () => {
		switch (action) {
			case "lock":
				return "Lock";
			case "logout":
				return "Log Out";
			case "reboot":
				return "Reboot";
			case "shutdown":
				return "Shutdown";
			default:
				return "";
		}
	};

	return (
		<button
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					command();
				}
			}}
			onKeyPressEvent={(_, event) => {
				if (event.get_keyval()[1] === Gdk.KEY_Return) {
					command();
				}
			}}
			canFocus={true}
			hasDefault={false}
			tooltip_text={tooltip()}
		>
			<box className={"sessioncontrol button"} vertical={true} halign={CENTER} valign={CENTER}>
				<icon icon={icon()} />
				<label label={label()} {...labelprops} />
			</box>
		</button>
	);
};

export default function SessionControls() {
	return (
		<box className={"sessioncontrols container"} valign={CENTER} halign={CENTER} visible={true}>
			<SysButton action={"lock"} />
			<SysButton action={"logout"} />
			<SysButton action={"reboot"} />
			<SysButton action={"shutdown"} />
		</box>
	);
}
