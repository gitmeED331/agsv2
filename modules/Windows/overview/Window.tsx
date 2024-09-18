import { bind, execAsync, Widget, App, Gtk, Gdk, Astal, Variable } from "astal";
import Hyprland from "gi://AstalHyprland"
import Icon, { Icons } from "../../lib/icons";
import { createSurfaceFromWidget } from "../../lib/utils";
const hyprland = Hyprland.get_default()

const TARGET = [Gtk.TargetEntry.new("text/plain", Gtk.TargetFlags.SAME_APP, 0)]
const apps = Astal.Application.get_instances()
type Client = Hyprland.Client

const dispatch = (arg: string | number) => {
    execAsync(`hyprctl dispatch workspace ${arg}`);
};

function setup(btn) {
    btn.on("drag-data-get", (_w, _c, data) => data.set_text(address, address.length));
    btn.on("drag-begin", (_, context) => {
        Gtk.drag_set_icon_surface(context, createSurfaceFromWidget(btn));
        btn.toggleClassName("hidden", true);
    });
    btn.on("drag-end", () => btn.toggleClassName("hidden", false));
    btn.drag_source_set(Gdk.ModifierType.BUTTON1_MASK, TARGET, Gdk.DragAction.COPY);
}

export default ({ address, size: [w, h], class: c, title }: Client) => {
    const scale = 15
    let monochrome = new Variable(true)
    return (
        <button
            className={"client"}
            tooltip_text={title}
            onClick={(_, event) => {
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    dispatch(`focuswindow address:${address}`)
                    App.toggle_window("overview")
                }
                if (event.button === Gdk.BUTTON_SECONDARY) {
                    dispatch(`closewindow address:${address}`)
                }
            }}
            setup={setup}
        >
            <icon
                css={`
            min-width: ${(scale / 100) * w}px;
            min-height: ${(scale / 100) * h}px;
            `}
                icon={monochrome.map(m => {
                    const app = apps.find(app => app.match(c));
                    if (!app) {
                        return Icon.fallback.executable + (m ? "-symbolic" : "");
                    }
                    return Icons(app.icon_name + (m ? "-symbolic" : ""));
                })}
            />
        </button>
    )
}

