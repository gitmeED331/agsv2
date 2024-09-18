import { Variable, Gdk, Gtk, Astal, Widget, App, execAsync } from "astal";
import Hyprland from "gi://AstalHyprland"
import Window from "./Window";

const hyprland = Hyprland.get_default()

const TARGET = [Gtk.TargetEntry.new("text/plain", Gtk.TargetFlags.SAME_APP, 0)]

const dispatch = (arg: string | number) => {
    execAsync(`hyprctl dispatch workspace ${arg}`);
};
const ClientsCatch = (arg: string | number) => {
    execAsync(`hyprctl dispatch workspace ${arg}`);
};


const size = (id: number) => {
    const def = { h: 1080, w: 1920 }
    const ws = hyprland.get_workspace(id)
    if (!ws)
        return def

    const mon = hyprland.get_monitor(ws.id)
    return mon ? { h: mon.height, w: mon.width } : def
}

const OVScale = new Variable(15)
const scale = (size: number) => (OVScale.get() / 100) * size


hyprland.connect("notify::clients", () => {

})
function Boxsetup(box, update, id) {
    box
        .hook(15, update)
        .hook(hyprland, update, "notify::clients")
        .hook(hyprland.focused_client, update)
        .hook(hyprland.focused_workspace, () => {
            box.toggle_className("active", hyprland.focused_workspace?.id === id)
        })
}

function Eventboxsetup(eventbox, id) {
    eventbox
        .drag_dest_set(Gtk.DestDefaults.ALL, TARGET, Gdk.DragAction.COPY)
        .connect("drag-data-received", (_w, _c, _x, _y, data) => {
            const address = new TextDecoder().decode(data.get_data())
            dispatch(`movetoworkspacesilent ${id},address:${address}`)
        })
}

export default (id: number) => {
    const fixed = new Gtk.Fixed()

    async function update() {
        const json = await ClientsCatch("j/clients").catch(() => null)
        if (!json)
            return

        fixed.get_children().forEach(ch => ch.destroy())
        const clients = JSON.parse(json) as typeof hyprland.clients
        clients
            .filter(({ workspace }) => workspace.id === id)
            .forEach(c => {
                const x = c.at[0] - (hyprland.get_monitor(c.monitor.id)?.x || 0)
                const y = c.at[1] - (hyprland.get_monitor(c.monitor.id)?.y || 0)
                c.mapped && fixed.put(Window(c), scale(x), scale(y))
            })
        fixed.show_all()
    }

    return (
        <box
            className={"workspace"}
            tooltipText={`${id}`}
            valign={Gtk.Align.CENTER}
            css={`
            min-width: ${(OVScale.get() / 100) * size(id).w}px;
            min-height: ${(OVScale.get() / 100) * size(id).h}px;
        `}
            setup={Boxsetup}
        >
            <eventbox
                expand={true}
                onClick={(_, event) => {
                    if (event.button === Gdk.BUTTON_PRIMARY) {
                        App.toggle_window("overview")
                        dispatch(`workspace ${id}`)
                    }
                    if (event.button === Gdk.BUTTON_SECONDARY) {
                        dispatch(`closewindow address:${address}`)
                    }
                }}
                setup={Eventboxsetup}
            >
                {fixed}

            </eventbox>
        </box >
    )
}

