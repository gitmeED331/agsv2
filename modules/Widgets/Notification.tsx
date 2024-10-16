import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { GLib, } from "astal";
import Icon from "../lib/icons";
import AstalNotifd from "gi://AstalNotifd";
import Pango from "gi://Pango";
import { Grid } from "../Astalified/index";

// const Notif = AstalNotifd.get_default();
// const item = AstalNotifd.Notification
const Time = (time: number, format = "%H:%M") =>
  GLib.DateTime.new_from_unix_local(time).format(format);
const Date = (time: number, format = "%b %d") =>
  GLib.DateTime.new_from_unix_local(time).format(format);

export default function NotifWidget({ item }) {
  const iconDateTime = (<box
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
  </box>)

  const notifTitle = (<box className={"titlebox"} vertical halign={Gtk.Align.FILL}>
    <label
      className={"title"}
      label={item.summary}
      maxWidthChars={50}
      lines={2}
      ellipsize={Pango.EllipsizeMode.END}
      halign={Gtk.Align.START}
    />
    <label
      className={"subtitle"}
      label={item.app_name}
      maxWidthChars={30}
      lines={1}
      ellipsize={Pango.EllipsizeMode.END}
      halign={Gtk.Align.START}
    />
  </box>)

  const notifBody = (<label
    className={"body"}
    label={item.body}
    maxWidthChars={50}
    lines={4}
    ellipsize={Pango.EllipsizeMode.END}
    halign={Gtk.Align.START}
    valign={Gtk.Align.START}
  />)

  const notifActions = (<box
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
  </box>)

  const theGrid = new Grid({
    className: `level${item.get_hint("urgency")?.unpack()} outerbox`,
    halign: Gtk.Align.FILL,
    valign: Gtk.Align.FILL,
    hexpand: true,
    vexpand: true,
    visible: true,
  })

  theGrid.attach(iconDateTime, 0, 0, 1, 3)
  theGrid.attach(notifTitle, 1, 0, 1, 1)
  theGrid.attach(notifBody, 1, 1, 1, 1)
  theGrid.attach(notifActions, 1, 2, 1, 1)

  return (
    <box
      vexpand={true}
      hexpand={false}
      visible={true}
    >
      {theGrid}
    </box>
  )
};