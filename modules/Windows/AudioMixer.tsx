import { Astal, Gdk, App } from "astal/gtk3";
import { AudioMixer } from "../Widgets/index";

export default () => (
	<window
		name={"audiomixerwindow"}
		className={"window audiomixer"}
		anchor={TOP | RIGHT}
		layer={Astal.Layer.OVERLAY}
		exclusivity={Astal.Exclusivity.NORMAL}
		keymode={Astal.Keymode.EXCLUSIVE}
		visible={false}
		application={App}
	>
		<eventbox
			onKeyPressEvent={(_, event) => {
				if (event.get_keyval()[1] === Gdk.KEY_Escape) {
					App.toggle_window("audiomixerwindow");
				}
			}}
		>
			<AudioMixer />
		</eventbox>
	</window>
);
