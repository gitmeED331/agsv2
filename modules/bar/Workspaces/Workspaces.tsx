import { GLib } from "astal";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP");

console.log(wm);

async function Workspaces() {
    let Workspaces
    switch (wm) {
        case "Hyprland":
            Workspaces = (await import("./HyprWorkspaces")).Workspaces;
            break;
        case "river":
            Workspaces = (await import("./RiverWorkspaces")).Workspaces;
            break;
        default:
            console.warn("could not determine compositor. Make sure the XDG_CURRENT_DESKTOP environment variable is set correctly.");
            Workspaces = () => <box />;
            break;
    };
}

export { Workspaces }

export default Workspaces;