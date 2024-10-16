import { Astal, App, Gtk, Gdk } from "astal/gtk3"
import { execAsync } from "astal"
import AstalAuth from "gi://AstalAuth"
import AstalBattery from "gi://AstalBattery"
import AstalMpris from "gi://AstalMpris"
import { Grid } from "./Astalified/index"
import Controls from "./Controls"

const battery = AstalBattery.get_default()
const mpris = AstalMpris.get_default()

AstalAuth.Pam.authenticate("password", (_, task) => {
    try {
        AstalAuth.Pam.authenticate_finish(task)
        print("authentication sucessful")
    } catch (error) {
        print(error)
    }
})

const Entry = (
    <entry
        className={"input"}
        placeholder_text="Search apps, C:: for teriminal commands..."
        on_changed={(self) => {
            const query = self.get_text().trim();
            currentQuery = query;
            if (!query.startsWith("C::") && !query.startsWith("W::")) {
                Search(query);
            }
        }}
        onKeyPressEvent={(self, event) => {
            const keyval = event.get_keyval()[1];
            const state = event.get_state()[1];
            const query = currentQuery.trim();

            if (keyval === Gdk.KEY_Return) {
                switch (true) {
                    case query.startsWith("C::"):
                        handleTerminalCommand(query, state, self);
                        break;

                    case query.startsWith("W::"):
                        handleWindowSearch(query);
                        break;

                    default:
                        break;
                }
            }
        }}
        hexpand={true}
        halign={Gtk.Align.FILL}
        valign={Gtk.Align.CENTER}
        tooltip_text={"Search applications, or use C:: for terminal, W:: for windows"}
        activates_default={true}
        focusOnClick={true}
    />
)


function Lockscreen() {
    const masterGrid = new Grid({
        halign: Gtk.Align.FILL,
        valign: Gtk.Align.FILL,
        hexpand: true,
        vexpand: true,
        visible: true,
    })
    masterGrid.attach(Controls(), 0, 0, 1, 1)
    masterGrid.attach(battery, 5, 0, 1, 1)
    return <window
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.EXCLUSIVE}
        visible={false}
        application={App}
    >
        {masterGrid}
    </window>
}

export default Lockscreen