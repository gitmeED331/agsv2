import Icon from '../lib/icons';
import { App, bind, execAsync, Gtk, Gdk, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";

// --- button click actions ---
const dispatch = (arg: string | number) => {
    execAsync(`hyprctl dispatch workspace ${arg}`);
};
const moveSilently = (arg: string | number) => {
    execAsync(`hyprctl dispatch movetoworkspacesilent ${arg}`);
};
const openOverview = (arg: string | number) => {
    const win = App.get_window("overview");
    if (win) { win.visible = !win.visible; }
};
// --- end button click actions ---

// --- signal handler ---
function ws(id: number) {
    const hyprland = Hyprland.get_default();
    const get = () => hyprland.get_workspace(id) || Hyprland.Workspace.dummy(id, null);

    return Variable(get())
        .observe(hyprland, "workspace-added", get)
        .observe(hyprland, "workspace-removed", get);
}
// --- end signal handler ---

// --- workspaces ---
export default function Workspaces({ id }: { id: number }) {

    const hyprland = Hyprland.get_default()

    function workspaceButton(id: number) {

        return (bind(ws(id)).as(ws => {
            const className = Variable.derive([
                bind(hyprland, "focusedWorkspace"),
                bind(ws, "clients"),
            ], (focused, clients) => `
                ${focused === ws ? "focused" : ""}
                ${clients.length > 0 ? "occupied" : "empty"}
                workspacebutton
            `)
            const isVisible = Variable.derive([
                bind(hyprland, "focusedWorkspace"),
                bind(ws, "clients"),
            ], (focused, clients) => (
                id <= 4 || (clients.length > 0) || (focused === ws)
            ))
            const wsIcon = Icon.wsicon
            const wsIconLabel =
                wsIcon[`ws${id}`] ?
                    <icon icon={wsIcon[`ws${id}`]} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} /> :
                    <label label={`${id}`} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
            return (
                <button
                    className={className()}
                    visible={isVisible()}
                    valign={Gtk.Align.CENTER}
                    halign={Gtk.Align.CENTER}
                    cursor="pointer"

                    onClick={(_, event) => {
                        if (event.button === Gdk.BUTTON_PRIMARY) {
                            dispatch(id);
                        }
                        if (event.button === Gdk.BUTTON_SECONDARY) {
                            moveSilently(id);
                        }
                        if (event.button === Gdk.BUTTON_MIDDLE) {
                            openOverview(id);
                        }
                    }}>

                    <box
                        halign={Gtk.Align.CENTER}
                        valign={Gtk.Align.CENTER}
                    >
                        {wsIconLabel}
                    </box >
                </button >
            )
        }))
    }

    const workspaceButtons = (Array.from({ length: 10 }, (_, id) => id + 1).map(id => workspaceButton(id)))

    return (<box
        className="workspaces"
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
    >
        {workspaceButtons}
    </box>
    )
}