import { Astal, App, Gdk } from "astal/gtk3";
import { wired, wifi } from "../Widgets/SystemStats/networkstats";
import systemStats from '../Widgets/SystemStats/systemStats';

export default (monitor: Gdk.Monitor) => (
    <window
        name={`systemstats${monitor}`}
        className={"stats window"}
        gdkmonitor={monitor}
        anchor={TOP | RIGHT}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.ON_DEMAND}
        visible={false}
        application={App}
        margin-top={45}
        onKeyPressEvent={(_, event) => {
            if (event.get_keyval()[1] === Gdk.KEY_Escape) {
                App.toggle_window(`systemstats${App.get_monitors()[0]}`);
            }
        }}
    >
        <box className={"stats container"} spacing={10} vertical>
            {[systemStats(), wifi, wired]}
        </box>
    </window>
);
