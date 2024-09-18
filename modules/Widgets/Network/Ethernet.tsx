import { bind, Gdk, Gtk, Widget, App, Astal, Variable, Binding } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import NM from "gi://NM"

const network = AstalNetwork.get_default();
const Wired = network.wired

function header() {
    const ethernetIcon = (
        <icon
            icon={bind(Wired, "icon_name")}
        />
    );

    const ethernetLabel = (
        <label
            label={"Ethernet"}
        />
    )

    const ethernetIndicator = (
        <box
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            vertical={false}
            spacing={5}
        >
            {[ethernetIcon, ethernetLabel]}
        </box>
    );

    return ethernetIndicator;
}
const status = (
    <box
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        spacing={5}
    >
        <label
            label={bind(Wired, "internet").as((i) => {
                switch (i) {
                    case 0:
                        return "Connected";
                    case 1:
                        return "Connecting";
                    case 2:
                        return "Disconnected";
                    default:
                        return "Disconnected";
                }
            })}
            halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
        />
    </box>
)
const Speed = (
    <label label={bind(Wired, "speed").as((s) => `${s} Mbps`)} />
)
function EthernetWidget() {
    return (
        <box
            className={"network ethernet container"}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            vertical={true}
        >
            <box
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                spacing={5}
                vertical={false}
            >
                {header()}
                {status}
            </box>
            {Speed}
        </box>
    )
}

export default EthernetWidget