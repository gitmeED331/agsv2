import { Astal, App, Gdk } from "astal/gtk3";
import { PowerProfiles } from "../Widgets/index";

export default () => (
	<window
		name={"powerprofiles"}
		className={"pwrprofiles window"}
		anchor={TOP | TOP}
		layer={Astal.Layer.OVERLAY}
		exclusivity={Astal.Exclusivity.NORMAL}
		keymode={Astal.Keymode.EXCLUSIVE}
		visible={false}
		application={App}
	>
		<eventbox
			onKeyPressEvent={(_, event) => {
				if (event.get_keyval()[1] === Gdk.KEY_Escape) {
					App.toggle_window("powerprofiles");
				}
			}}
		>
			<PowerProfiles />
		</eventbox>
	</window>
);
