import { Astal, App, Widget, Gtk, Gdk } from "astal"
import Hyprland from "gi://AstalHyprland"
import Workspace from "./Workspace"

const hyprland = Hyprland.get_default()
function range(n: number) {
    return Array.from({ length: n }, (_, i) => i + 1);
}
function OVSetup(ws: number) {
    return (w: any) => {
        if (ws <= 0) return;

        w.hook(hyprland, (w: any, id?: string) => {
            if (id === undefined || id === null) return;

            if (typeof id !== 'string') {
                console.error('Invalid pointer type:', id);
                return;
            }

            w.children = w.children.filter(ch => ch.attribute.id !== Number(id));
        }, "workspace-removed");

        w.hook(hyprland, (w: any, id?: string) => {
            if (id === undefined || id === null) return;
            if (typeof id !== 'string') {
                console.error('Invalid pointer type:', id);
                return;
            }

            w.children = [...w.children, Workspace(Number(id))].sort((a, b) => a.attribute.id - b.attribute.id);
        }, "workspace-added");
    };
}

const Overview = ({ ws }: { ws: number }) => (
    <box className="ovhorizontal" setup={OVSetup(ws)}>
        {ws > 0
            ? Array.from({ length: ws }, (_, id) => <Workspace id={id} />)
            : hyprland.workspaces.slice().sort((a, b) => a.id - b.id).map(({ id }) => <Workspace id={id} />)
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
