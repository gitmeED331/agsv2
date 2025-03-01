import { Astal, Gdk, App } from "astal/gtk3";
import { GridCalendar } from "../Widgets/index";

export default function Calendar() {
	return (
		<window
			name={"calendar"}
			className={"window calendar"}
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
						App.toggle_window("calendar");
					}
				}}
			>
				<box className={"calendarbox"}>
					<GridCalendar />
				</box>
			</eventbox>
		</window>
	);
}
