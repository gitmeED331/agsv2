import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { Player, GridCalendar } from "../../modules/Widgets/index";

export default function uniWindow(WN: string, KM: string, EM: string, LM: string, AM: Array<string>, { monitor }: { monitor: number }) {
    return <window
        name={WN}
        className={`window ${WN}`}
        anchor={Astal.WindowAnchor[AM]}
        layer={Astal.Layer[LM]}
        exclusivity={Astal.Exclusivity[EM]}
        keymode={Astal.Keymode[KM]}
        visible={false}
        application={App}
        onKeyPressEvent={(_, event) => {
            const win = App.get_window(WN);
            if (event.get_keyval()[1] === Gdk.KEY_Escape) { if (win && win.visible === true) { win.visible = false; } }
        }}
    >
        <WN />
    </window>
}