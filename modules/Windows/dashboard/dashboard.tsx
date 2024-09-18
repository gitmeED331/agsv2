import { Astal, bind, Widget, Gtk, App, Gdk, Variable } from "astal";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import Mpris from "gi://AstalMpris";
import Icon, { Icons } from "../../lib/icons";

const player = Mpris.Player.new("Deezer");
// --- imported widgets ---
import {
  BrightnessSlider,
  GridCalendar,
  Player,
  PowerProfiles,
  Tray,
  BluetoothDevices,
  EthernetWidget,
  WifiAPs,
  AudioMixer,
  SessionControls,
} from "../../Widgets/index";
import { NotificationList } from "./notificationList";

function LeftSide() {
  const settings = (
    <box name={"settings"} vertical={true} spacing={10}>
      <AudioMixer />
      <BrightnessSlider />
    </box>
  )
  const power = (
    <box name={"power"} className={"dashboard power"} vertical={true} spacing={10}>
      <PowerProfiles />
      <SessionControls />
    </box>
  )
  const stack = (
    <stack
      className={"dashboard stack"}
      transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
      transitionDuration={300}
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.FILL}
      hexpand={true}
      vexpand={true}
      homogeneous={false}
    >
      <GridCalendar />
      {power}
      {settings}
    </stack >
  );

  const stackSwitcher = (
    <centerbox
      className={"dashboard stackSwitcher"}
      vertical={false}
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.FILL}
      spacing={5}
    >
      <button
        className={bind(stack, "visible_child_name").as((name) => name === "calendar" ? "active" : "")}
        label="Calendar"
        onClick={() => {
          stack.set_visible_child_name("calendar");
        }}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
      <button
        className={bind(stack, "visible_child_name").as((name) => name === "power" ? "active" : "")}
        label="Power Control"
        onClick={() => {
          stack.set_visible_child_name("power");
        }}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
      <button
        className={bind(stack, "visible_child_name").as((name) => name === "settings" ? "active" : "")}
        label="Settings"
        onClick={() => {
          stack.set_visible_child_name("settings");
        }}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
    </centerbox>
  );
  return (
    <box
      className={"dashboard leftSide"}
      vertical={true}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.START}
      hexpand={true}
      vexpand={true}
      spacing={10}
    >
      {stackSwitcher}
      {stack}
    </box>
  )
}

function RightSide() {
  const stack = (
    <stack
      className={"dashboard stack"}
      transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
      transitionDuration={300}
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.FILL}
      hexpand={true}
      vexpand={true}
    >
      <NotificationList />
      <box name={"network"} className={"network dashboard"} vertical={true} spacing={5}>
        <EthernetWidget />
        <WifiAPs />
      </box>
      <BluetoothDevices />
    </stack >
  )
  const stackSwitcher = (
    <centerbox
      className={"dashboard stackSwitcher"}
      vertical={false}
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.FILL}
      spacing={5}
    >
      <button
        className={bind(stack, "visible_child_name").as((name) => name === "notifications" ? "active" : "")}
        label="Notifications"
        onClick={() => {
          stack.set_visible_child_name("notifications");
        }}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
      <button
        className={bind(stack, "visible_child_name").as((name) => name === "network" ? "active" : "")}
        label="Network"
        onClick={() => {
          stack.set_visible_child_name("network");
        }}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
      <button
        className={bind(stack, "visible_child_name").as((name) => name === "bluetooth" ? "active" : "")}
        label="Bluetooth"
        onClick={() => {
          stack.set_visible_child_name("bluetooth");
        }}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
    </centerbox>
  );
  return (
    <box
      className={"dashboard rightSide"}
      vertical={true}
      halign={Gtk.Align.FILL}
      valign={Gtk.Align.FILL}
      hexpand={true}
      vexpand={true}
      spacing={10}
    // css={`background-color: black;`}
    // widthRequest={winwidth(0.25)}
    // heightRequest={winheight(0.25)}
    >
      {stackSwitcher}
      {stack}
    </box>
  )
}

function Dashboard() {
  const content = (
    <box
      className={"dashboard container"}
      vertical={true}
      vexpand={true}
      hexpand={false}
      valign={Gtk.Align.START}
      halign={Gtk.Align.CENTER}
      heightRequest={winheight(0.5)}
      widthRequest={winwidth(0.25)}
      css={`
          padding: 1.5rem;
        `}
    >
      <box vertical={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={10}>

        <Player player={player} />
      </box>
      <box vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={10} >
        <LeftSide />
        <Tray />
        <RightSide />
      </box>
    </box>
  );
  return (
    <window
      name={"dashboard"}
      className={"dashboard window"}
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.BOTTOM
      }
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.EXCLUSIVE}
      visible={false}
      application={App}
    >
      <eventbox
        onKeyPressEvent={(_, event) => {
          if (event.get_keyval()[1] === Gdk.KEY_Escape) {
            App.toggle_window("dashboard");
          }
        }}
        onClick={() => {
          App.toggle_window("dashboard");
        }}
      >
        {content}
      </eventbox>
    </window>
  );
}
export default Dashboard;
