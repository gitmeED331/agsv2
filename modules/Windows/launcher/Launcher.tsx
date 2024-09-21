import { App, bind, Widget, Astal, Gdk, Gtk, execAsync } from "astal";
import AstalApps from "gi://AstalApps";
import Icon, { Icons } from "../../lib/icons";
import { winwidth } from "../../lib/screensizeadjust";
import { StackSwitcher } from "../../Astalified/StackSwitcher";


const Apps = new AstalApps.Apps({
    include_entry: true,
    include_executable: true,
    include_description: true,
})
const Applications = Apps.list
const Categories = Apps.get_categories();

function theApps() {

    return Applications.map((app) => {
        return <button
            className="app"
            name={app.get_name()}
            tooltip_text={app.get_description()}
            on_clicked={() => {
                app.launch();
                App.toggle_window("launcher");
            }}
        >
            <box vertical={true}>
                <icon icon={bind(app, "icon_name")} />
                <label label={bind(app, "name")} />
            </box>
        </button>
    })
}

const theStack = new Gtk.Stack({
    transitionType: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
    transitionDuration: 300,
    halign: Gtk.Align.FILL,
    valign: Gtk.Align.FILL,
    hhomogeneous: true,
    vhomogeneous: false,
    visible: true,
    hexpand: false,
    vexpand: true,
});

Applications.forEach((category) => theStack.add_named(theApps(), `${category}`))


function SSsetup(stackSwitcher: StackSwitcher) {
    stackSwitcher.set_stack(theStack);
}

const stackSwitcher = new StackSwitcher({
    className: "dashboard stackSwitcher",
    setup: SSsetup,
    halign: Gtk.Align.CENTER,
    valign: Gtk.Align.START,
    spacing: 10,
    orientation: Gtk.Orientation.VERTICAL,
});



export default function Launcher() {

    return <window
        name={"launcher"}
        className={"launcher"}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.NONE}
        visible={false}
        application={App}
    >
        <box className={"dashboard leftSide"} vertical={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.START} hexpand={true} vexpand={true} spacing={10}>
            {stackSwitcher}
            {theStack}
        </box>
    </window>


}