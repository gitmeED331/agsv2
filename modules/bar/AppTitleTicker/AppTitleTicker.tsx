import { GLib } from "astal";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP");

async function AppTitleTicker() {
    let AppTitleTicker

    switch (wm) {
        case "Hyprland":
            AppTitleTicker = (await import("./HyprAppTitleTicker")).AppTitleTicker;
            break;
        case "river":
            AppTitleTicker = (await import("./RiverAppTitleTicker")).AppTitleTicker;
            break;
        default:
            console.warn("could not determine compositor. Make sure the XDG_CURRENT_DESKTOP environment variable is set correctly.");
            AppTitleTicker = () => <box />;
            break;
    };
}
export {
    AppTitleTicker
};
export default AppTitleTicker    