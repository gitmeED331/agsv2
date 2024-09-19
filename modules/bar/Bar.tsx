import { App, Astal, Gtk, execAsync } from "astal";
// import Hyprland from "gi://AstalHyprland";

// ----- Widgets -----
import AppTitleTicker from "./AppTitleTicker";
import Workspaces from "./Workspaces";
import Clock from "./clock";
import SysInfo from "./sysinfo";
import MediaTickerButton from "./MediaTicker";

function LeftBar() {
  return (
    <box
      className={"left"}
      halign={Gtk.Align.START}
      valign={Gtk.Align.START}
      spacing={5}
    >
      <Workspaces id={Number()} />
      <AppTitleTicker />
    </box>
  );
}

function CenterBar() {
  return (
    <box
      className={"center"}
      spacing={10}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.START}
    >
      <Clock />
    </box>
  );
}

function RightBar() {
  return (
    <box
      className={"right"}
      halign={Gtk.Align.END}
      valign={Gtk.Align.START}
      spacing={5}
    >
      <MediaTickerButton />
      <SysInfo />
    </box>
  );
}
export default function Bar({ monitor }: { monitor: number }) {
  return (
    <window
      className={"bar"}
      name={`bar${monitor}`}
      monitor={monitor}
      application={App}
      anchor={
        Astal.WindowAnchor.TOP
        | Astal.WindowAnchor.LEFT
        | Astal.WindowAnchor.RIGHT
      }
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
    >
      <centerbox>
        <LeftBar />
        <CenterBar />
        <RightBar />
      </centerbox>
    </window>
  );
}
