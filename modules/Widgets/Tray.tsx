import { Gdk, Gtk, bind } from "astal";
import AstalTray from "gi://AstalTray";
import Icon, { Icons } from "../lib/icons";

const SystemTray = AstalTray.Tray.get_default();

const SysTrayItem = (item) => {
  const menu = item.create_menu?.();
  let clickTimeout: any = null;
  let clickCount = 0;
  return (
    <button
      className={"systray-item"}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClick={(btn, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          clickCount++;
          if (clickCount === 1) {
            clickTimeout = setTimeout(() => {
              clickCount = 0;
            }, 400);
          } else if (clickCount === 2) {
            clearTimeout(clickTimeout);
            clickCount = 0;
            item.activate(0, 0);
          }
        }
        if (event.button === Gdk.BUTTON_SECONDARY) {
          menu?.popup_at_widget(
            btn,
            Gdk.Gravity.EAST,
            Gdk.Gravity.WEST,
            null,
          );
        }
      }}
      tooltip_markup={bind(item, "tooltip_markup")}
    >
      <icon
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        g_icon={bind(item, "gicon").as((gicon) => gicon || Icons(item.icon_name))}
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
