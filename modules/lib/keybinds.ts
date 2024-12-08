import { Gdk } from "astal/gtk3"
import { execAsync, GLib } from "astal"

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();
const monitor = Gdk.Monitor

// Define modifiers
const MOD = "SUPER";
const MODS = "SUPER+SHIFT";
const MODA = "SUPER+ALT";
const MODC = "SUPER+CONTROL";
const MODAS = "SUPER+SHIFT+ALT";
const MODCS = "SUPER+SHIFT+CONTROL";
const MODCAS = "SUPER+SHIFT+CONTROL+ALT";

function HyprlandKeybinds() {
    execAsync(`hyprctl keyword bind '${MOD} X exec ags toggle dashboard${monitor}'`);
    execAsync(`hyprctl keyword bind '${MODS} ESCAPE exec ags toggle sessioncontrols${monitor}'`);
    execAsync(`hyprctl keyword bind '${MODA} W exec ags toggle wallpapers${monitor}'`);
}

function RiverKeybinds() {
    execAsync(`riverctl map normal ${MOD} X spawn ags toggle dashboard${monitor}`);
    execAsync(`riverctl map normal ${MODS} Escape spawn ags toggle sessioncontrols${monitor}`);
    execAsync(`riverctl map normal ${MODA} W spawn ags toggle wallpapers${monitor}`);
}

export default function () {
    if (wm === "hyprland") {
        HyprlandKeybinds();
    } else if (wm === "river") {
        RiverKeybinds();
    } else {
        print("Unsupported window manager: " + wm);
    }
}