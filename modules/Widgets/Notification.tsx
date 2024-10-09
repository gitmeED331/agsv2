import {
  Gtk,
  GLib,
} from "astal";
import Icon, { Icons } from "../lib/icons";
import AstalNotifd from "gi://AstalNotifd";
import Pango from "gi://Pango";

// const Notif = AstalNotifd.get_default();
// const item = AstalNotifd.Notification
const Time = (time: number, format = "%H:%M") =>
  GLib.DateTime.new_from_unix_local(time).format(format);
const Date = (time: number, format = "%b %d") =>
  GLib.DateTime.new_from_unix_local(time).format(format);

export default function NotifWidget({ item }) {
  return (
    <box
      className={`level${item.get_hint("urgency")?.unpack()} outerbox`}
      vertical={false}
      vexpand={true}
      hexpand={false}
      visible={true}
    >
      <box
        className={"icondatetime"}
        vertical={true}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.START}
        spacing={5}
      >
        <icon
          className={"icon"}
          icon={
            item.get_app_icon() ||
            item.get_desktop_entry() ||
            Icon.fallback.notification
          }
          valign={Gtk.Align.CENTER}
          halign={Gtk.Align.CENTER}
        />
        <box vertical={true} className={"datetime"}>
          <label
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            lines={1}
            maxWidthChars={6}
            visible={true}
            label={Date(item.time)?.toString()}
          />
          <label
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            lines={1}
            maxWidthChars={6}
            label={Time(item.time)?.toString()}
          />
        </box>
      </box>
      <box
        vertical={true}
        valign={Gtk.Align.START}
        halign={Gtk.Align.START}
      >
        <label
          className={"title"}
          label={item.summary}
          maxWidthChars={50}
          lines={2}
          ellipsize={Pango.EllipsizeMode.END}
          halign={Gtk.Align.START}
          valign={Gtk.Align.START}
        />
        <label
          className={"body"}
          label={item.body}
          maxWidthChars={50}
          lines={3}
          ellipsize={Pango.EllipsizeMode.END}
          halign={Gtk.Align.START}
          valign={Gtk.Align.CENTER}
        />
        <box
          className={"actions"}
          valign={Gtk.Align.END}
          halign={Gtk.Align.FILL}
        >
          {item.get_actions().map((action) => (
            <button
              onClick={() => {
                item.invoke(action.id);
                item.dismiss();
              }}
              hexpand={true}
            >
              <label label={action.label} />
            </button>
          ))}
        </box>
      </box>
    </box>
  )
};