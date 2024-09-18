import { Widget, Astal, App, Gdk } from "astal"
import AudioMixer from "../Widgets/AudioMixer"

export default () => <window
    name={"audiomixerwindow"}
    className={"window audiomixer"}
    anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
    layer={Astal.Layer.OVERLAY}
    exclusivity={Astal.Exclusivity.NORMAL}
    keymode={Astal.Keymode.EXCLUSIVE}
    visible={false}
    application={App}
    margin-right={50}
>
    <eventbox onKeyPressEvent={(_, event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) { App.toggle_window("audiomixerwindow") }
    }}>
        <AudioMixer />
    </eventbox>
</window>

