import { Gtk } from "astal/gtk3";
import { GObject } from "astal";

export function createScrollablePage(items: any[]) {
    const scrollable = (
        <Gtk.ScrolledWindow
            hexpand={true}
            vexpand={true}
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            visible={true}
            setup={(self) => {
                const listBox = new Gtk.ListBox();
                listBox.set_selection_mode(Gtk.SelectionMode.NONE);

                items.forEach((item) => {
                    const row = new Gtk.ListBoxRow();
                    const box = new Gtk.Box({
                        orientation: Gtk.Orientation.HORIZONTAL,
                        spacing: 10,
                    });

                    const label = new Gtk.Label({
                        label: typeof item === "string" ? item : item.get_name(),
                        xalign: 0,
                    });

                    box.append(label);
                    row.set_child(box);
                    listBox.append(row);
                });

                self.set_child(listBox);
            }}
        />
    );

    return scrollable;
}
