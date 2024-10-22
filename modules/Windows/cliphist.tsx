import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { execAsync, GLib, } from "astal";
import Pango from "gi://Pango"
import { Grid, Fixed } from "../Astalified/index"
import { winwidth, winheight } from "../lib/screensizeadjust";
import Icon from "../lib/icons"
import ClickToClose from "../lib/ClickToClose";

type EntryObject = {
    id: string;
    content: string;
    entry: string;
};

function ClipHistItem(entry: string) {
    const [id, ..._content] = entry.split("\t");
    const content = _content.join(" ").trim();
    let clickCount = 0;

    const createButton = (id: string, content: string, onClick: () => void) => (
        <button className="cliphist item" on_click={onClick}>
            <label
                label={`${id} - ${content}`} // This is the label we search
                xalign={0}
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.START}
                ellipsize={Pango.EllipsizeMode.END}
            />
        </button>
    );

    const button = createButton(id, content, () => {
        clickCount++;
        if (clickCount === 2) {
            App.toggle_window("cliphist");
            execAsync(`${GLib.get_user_config_dir()}/ags/scripts/cliphist.sh --copy-by-id ${id}`);
            clickCount = 0;
            entry.set_text("");
            repopulate();
        }
    });

    button.connect("focus-out-event", () => {
        clickCount = 0;
    });

    return <box attribute={{ content, id }} vertical visible={true}>
        {button}
    </box>;
}


const entry = <entry
    className="search"
    placeholder_text="Search"
    hexpand={true}
    halign={Gtk.Align.FILL}
    valign={Gtk.Align.CENTER}
    activates_default={true}
    focusOnClick={true}
    widthRequest={winwidth(0.15)}
    onChanged={({ text }) => {
        const searchText = (text ?? "").toLowerCase();
        list.children.forEach(item => {
            item.visible = item.attribute.content.toLowerCase().includes(searchText);
        });
    }}
/>

const list = <box vertical spacing={5} />
let output: string;
let entries: string[];
let clipHistItems: EntryObject[];
let widgets: Box<any, any>[];

async function repopulate() {
    output = await execAsync(`${GLib.get_user_config_dir()}/ags/scripts/cliphist.sh --get`)
        .then((str) => str)
        .catch((err) => {
            print(err);
            return "";
        });
    entries = output.split("\n").filter((line) => line.trim() !== "");
    clipHistItems = entries.map((entry) => {
        let [id, ...content] = entry.split("\t");
        return { id: id.trim(), content: content.join(" ").trim(), entry: entry };
    });
    widgets = clipHistItems.map((item) => ClipHistItem(item.entry));
    list.children = widgets;
}

repopulate();

function ClipHistWidget() {
    const scrollableList = (
        <scrollable
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            vexpand={true}
        >
            {list}
        </scrollable>
    )
    const header = () => {

        const clear = <button
            className="clear_hist"
            valign={Gtk.Align.CENTER}
            on_clicked={() => {
                // execAsync(`${GLib.get_user_config_dir()}/ags/scripts/cliphist.sh --clear`)
                execAsync(`cliphist wipe`)
                    .then(repopulate)
                    .catch(console.error);
                entry.set_text("");
            }}
        >
            <icon icon={Icon.cliphist.delete} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} />
        </button>
        const refresh = <button
            className="refresh_hist"
            valign={Gtk.Align.CENTER}
            onClicked={() => {
                repopulate();
                entry.set_text("");
            }}
        >
            <icon icon={Icon.ui.refresh} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} />
        </button>
        return <box className="cliphist header" spacing={5}>
            {[entry, clear, refresh]}
        </box>
    };

    const theGrid = new Grid({
        className: "cliphist contentgrid",
        halign: Gtk.Align.FILL,
        valign: Gtk.Align.FILL,
        hexpand: true,
        vexpand: true,
        visible: true,
    });

    theGrid.attach(header(), 1, 1, 1, 1);
    theGrid.attach(scrollableList, 1, 2, 1, 1);

    return (
        <box orientation={Gtk.Orientation.VERTICAL} className="cliphist container" halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
            {theGrid}
        </box>
    );
}

function cliphist({ monitor }: { monitor: number }) {
    const masterGrid = new Grid({
        className: "cliphist mastergrid",
        halign: Gtk.Align.FILL,
        valign: Gtk.Align.FILL,
        hexpand: true,
        vexpand: true,
        visible: true,
    });

    masterGrid.attach(ClickToClose(1, 0.75, 0.75, "cliphist"), 1, 1, 1, 1);
    masterGrid.attach(ClipHistWidget(), 2, 1, 1, 1);

    return <window
        name={"cliphist"}
        className={"cliphist"}
        application={App}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        keymode={Astal.Keymode.EXCLUSIVE}
        visible={false}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.BOTTOM
            | Astal.WindowAnchor.RIGHT
            | Astal.WindowAnchor.LEFT
        }
        onKeyPressEvent={(_, event) => {
            const win = App.get_window("cliphist");
            if (event.get_keyval()[1] === Gdk.KEY_Escape && win?.visible) {
                win.visible = false;
            }
        }}
    >
        {masterGrid}
    </window>
}

App.connect("window-toggled", (_, win) => {
    if (win.name === "cliphist") {
        entry.set_text("");
        entry.grab_focus();
        repopulate();
    }
})

export default cliphist