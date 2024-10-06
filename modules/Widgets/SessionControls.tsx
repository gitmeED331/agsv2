import { App, Astal, execAsync, Gdk, Gtk, GLib } from "astal";
import Icon, { Icons } from "../lib/icons.js";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase() || "river";

const SysButton = (action: string, label: string) => {
    const command = (() => {
        switch (action) {
            case "lock":
                return "hyprlock";
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
                    execAsync(command);
                    if (win && !win.visible) { win.visible = false; }
                }
            }
            }
        >
            <box
                className={"sessioncontrol button"}
                vertical={true}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
            >
                <icon icon={Icon.powermenu[action]} />
                <label label={label} />
            </box>
        </button >
    );
};

function SessionControls() {
    return <box
        className={"sessioncontrols container"}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        visible={true}
    >
        {SysButton("lock", "Lock")}
        {SysButton("logout", "Log Out")}
        {SysButton("reboot", "Reboot")}
        {SysButton("shutdown", "Shutdown")}
    </box>

}
export default SessionControls