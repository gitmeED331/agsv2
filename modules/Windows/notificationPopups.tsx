import { App, Widget, Astal, Gtk, Gdk, GLib, timeout } from "astal";
import Notifd from "gi://AstalNotifd";
import Icon, { Icons } from "../lib/icons";
import NotifWidget from "../Widgets/Notification";

const Notif = Notifd.get_default();
const transitionTime = 300;
const expireTime = 30000;

const Time = (time: number, format = "%H:%M.%S") =>
  GLib.DateTime.new_from_unix_local(time).format(format);
const Date = (time: number, format = "%b %d") =>
  GLib.DateTime.new_from_unix_local(time).format(format);

function removeItem(box, notificationItem) {
  box.remove(notificationItem);
}

function isDoNotDisturbEnabled() {
  return Notif.get_dont_disturb();
}

function NotifItem() {
  const box = new Widget.Box({
    vertical: true,
    spacing: 10,
    hexpand: true,
    vexpand: true,
  });


  Notif.connect("notified", (_, id) => {
    if (isDoNotDisturbEnabled()) {
      print("Notification blocked due to Do Not Disturb mode.");
      return;
    }

    const notification = Notif.get_notification(id);
    if (notification) {
      const notificationItem = (
        <eventbox
          onClick={(_, event) => {
            if (event.button === Gdk.BUTTON_PRIMARY) {
              removeItem(box, notificationItem);
            } else if (event.button === Gdk.BUTTON_SECONDARY) {
              notification.dismiss();
            }
          }}
          onHoverLost={() => {
            removeItem(box, notificationItem);
          }}
        >
          <NotifWidget item={notification} />
        </eventbox>
      );

      box.add(notificationItem);

      notification.connect("dismissed", () => {
        removeItem(box, notificationItem);
      });

      timeout(expireTime, () => {
        notification.dismiss();
        removeItem(box, notificationItem);
      });
    }
  });

  return box;
}

function NotifPopup() {
  return (
    <box
      className={"notif"}
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.START}
      vexpand={true}
      vertical={true}
      spacing={10}
      widthRequest={450}
    >
      <NotifItem />
    </box>
  );
}

export default (monitor: number) => (
  <window
    name={`notifications${monitor}`}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
    className={"notifications"}
    hexpand={true}
    layer={Astal.Layer.OVERLAY}
    application={App}
  >
    <NotifPopup />
  </window>
);
