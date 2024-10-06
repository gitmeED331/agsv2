import { App, Astal, Gtk, Gdk, GLib, execAsync } from "astal";
// ----- Widgets -----
import Clock from "./clock";
import SysInfo from "./sysinfo";
import MediaTickerButton from "./MediaTicker";

// ----- hyprland Widgets -----
// import HyprWorkspaces from "./Workspaces/HyprWorkspaces"
// import HyprAppTitleTicker from "./AppTitleTicker/HyprAppTitleTicker"

// ----- river Widgets -----
// import RiverWorkspaces from "./Workspaces/RiverWorkspaces"
// import RiverAppTitleTicker from "./AppTitleTicker/RiverAppTitleTicker"

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase() || "river";

function loadWorkspaces(wm: string) {
  if (wm === "hyprland") {
    const { default: HyprWorkspaces } = require("./Workspaces/HyprWorkspaces");
    return HyprWorkspaces;
  } else if (wm === "river") {
    const { default: RiverWorkspaces } = require("./Workspaces/RiverWorkspaces");
    return RiverWorkspaces;
  }
}

function loadAppTitleTicker(wm: string) {
  if (wm === "hyprland") {
    const { default: HyprAppTitleTicker } = require("./AppTitleTicker/HyprAppTitleTicker");
    return HyprAppTitleTicker;
  } else if (wm === "river") {
    const { default: RiverAppTitleTicker } = require("./AppTitleTicker/RiverAppTitleTicker");
    return RiverAppTitleTicker;
  }
}

function LeftBar() {

  const WorkspacesComponent = loadWorkspaces(wm);
  const AppTitleTickerComponent = loadAppTitleTicker(wm);

  return (
    <box
      className="left"
      halign={Gtk.Align.START}
      valign={Gtk.Align.START}
      spacing={5}
    >
      <WorkspacesComponent id={Number()} />
      <AppTitleTickerComponent />
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
