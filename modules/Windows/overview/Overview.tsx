import { Astal, App, Widget, Gtk, Gdk } from "astal"
import Hyprland from "gi://AstalHyprland"
import Workspace from "./Workspace"

const hyprland = Hyprland.get_default()
function range(n: number) {
    return Array.from({ length: n }, (_, i) => i + 1);
}
function OVSetup() {
    return (w => {
        if (ws > 0)
            return

        w.hook(hyprland, (w, id?: string) => {
            if (id === undefined)
                return

            w.children = w.children
                .filter(ch => ch.attribute.id !== Number(id))
        }, "workspace-removed")
        w.hook(hyprland, (w, id?: string) => {
            if (id === undefined)
                return

            w.children = [...w.children, Workspace(Number(id))]
                .sort((a, b) => a.attribute.id - b.attribute.id)
        }, "workspace-added")
    }
    )
}

const Overview = ({ ws }: { ws: number }) => (
    <box
        className={"ovhorizontal"}
        setup={OVSetup()}
    >
        {ws > 0
            ? range(ws).map(Workspace)
            : hyprland.workspaces
                .map(({ id }) => Workspace(id))
                .sort((a, b) => a.attribute.id - b.attribute.id)
        }
    </box>
)

export default () => (
    <window
        name={"overview"}
        layer={Astal.Layer.TOP}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.NONE}
        visible={false}
        application={App}
    >
        <Overview ws={hyprland.workspaces.length} />
    </window>
)
