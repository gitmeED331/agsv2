import { Gdk, Gtk, bind } from "astal";
import AstalTray from "gi://AstalTray";
import Icon, { Icons } from "../lib/icons";

const SystemTray = AstalTray.Tray.get_default();

const SysTrayItem = (item) => {
  const menu = item.create_menu?.();

  return (
    <button
      className={"systray-item"}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClick={(btn, event) => {
        if (
          event.button === Gdk.BUTTON_PRIMARY ||
          event.button === Gdk.BUTTON_SECONDARY
        ) {
          menu?.popup_at_widget(
            btn,
            Gdk.Gravity.EAST,
            Gdk.Gravity.WEST,
            null,
          );
        } else if (event.button === Gdk.BUTTON_MIDDLE) {
          item.activate(0, 0);
        }
      }}
      tooltip_markup={bind(item, "tooltip_markup")}
    >
      <icon
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        g_icon={bind(item, "gicon")}
      // pixbuf={bind(item, "icon_pixbuf")}
      // icon={bind(item, "icon_name")}
      />
    </button>
  );
};

function traySetup(box) {
  const items = new Map();

  const addItem = (id: number) => {
    const item = SystemTray.get_item(id);
    if (item) {
      const trayItem = SysTrayItem(item);
      items.set(id, trayItem);
      box.add(trayItem);
      trayItem.show();
    }
  };

  const removeItem = (id) => {
    const trayItem = items.get(id);
    if (trayItem) {
      trayItem.destroy();
      items.delete(id);
    }
  };

  SystemTray.get_items().forEach((item) => addItem(item.item_id));
  SystemTray.connect("item_added", (SystemTray, id) => addItem(id));
  SystemTray.connect("item_removed", (SystemTray, id) => removeItem(id));
}

function Tray() {
  return <box className={"tray container"} setup={traySetup} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} vertical={true} />;
}
export default Tray;
