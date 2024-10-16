import { Astal, App, Gtk, Gdk } from "astal/gtk3"
import { execAsync } from "astal"
import { Grid } from "./Astalified/index"


const Controls = () => {
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
                onClick={(_, event) => {
                    const win = App.get_window("sessioncontrols");
                    if (event.button === Gdk.BUTTON_PRIMARY) {
                        execAsync(command);
                        if (win && win.visible === true) { win.visible = false; }
                    }
                }
                }
                onKeyPressEvent={(_, event) => {
                    const win = App.get_window("sessioncontrols");
                    if (event.get_keyval()[1] === Gdk.KEY_Return) {
                        execAsync(command);
                        if (win && !win.visible) { win.visible = false; }
                    }
                }
                }
                canFocus={true}
                hasDefault={false}
            >
                <box
                    className={"sessioncontrol button"}
                    vertical={true}
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                >
                    <icon icon={Icon.powermenu[action]} />
                </box>
            </button >
        );
    };
    const CGrid = new Grid({
        halign: Gtk.Align.FILL,
        valign: Gtk.Align.FILL,
        hexpand: true,
        vexpand: true,
        visible: true,
    })

    CGrid.attach(SysButton("reboot"), 0, 0, 1, 1)
    CGrid.attach(SysButton("shutdown"), 1, 0, 1, 1)

    return <box>
        {CGrid}
    </box>
}
export default Controls