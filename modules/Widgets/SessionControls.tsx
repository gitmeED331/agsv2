import { App, Astal, execAsync, Gdk, Gtk } from "astal";
import Icon, { Icons } from "../lib/icons.js";

const SysButton = (action: string, label: string) => {
    const command = (() => {
        switch (action) {
            case "lock":
                return "bash -c 'exec ags -b lockscreen -c ~/.config/ags/Lockscreen/lockscreen.js'";
            case "reboot":
                return "systemctl reboot";
            case "logout":
                return "bash -c 'exec  ~/.config/hypr/scripts/hyprkill.sh >/dev/null 2>&1 &'";
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
                    if (win && !win.visible) { win.visible = !win.visible; }
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