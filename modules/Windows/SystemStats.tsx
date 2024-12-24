import { Astal, App, Gdk } from "astal/gtk3";
import { wired, wifi } from "../Widgets/SystemStats/networkstats";
import systemStats from "../Widgets/SystemStats/systemStats";
import PopupWindow from "../lib/popupwindow";

export default function (monitor: Gdk.Monitor) {
	return (
		<PopupWindow
			name={`systemstats${monitor.get_model()}`}
			exclusivity={Astal.Exclusivity.NORMAL}
			xcoord={0.8}
			ycoord={0.1}
			child={
				<box className={"stats container"} spacing={10} vertical>
					{[systemStats(), wifi, wired]}
				</box>
			}
			transition={REVEAL_CROSSFADE}
		/>
	);
	// <window
	//     name={`systemstats${monitor}`}
	//     className={"stats window"}
	//     gdkmonitor={gdkmonitor}
	//     anchor={TOP | RIGHT}
	//     layer={Astal.Layer.OVERLAY}
	//     exclusivity={Astal.Exclusivity.NORMAL}
	//     keymode={Astal.Keymode.ON_DEMAND}
	//     visible={false}
	//     application={App}
	//     margin-top={45}
	//     onKeyPressEvent={(_, event) => {
	//         if (event.get_keyval()[1] === Gdk.KEY_Escape) {
	//             App.toggle_window(`systemstats${App.get_monitors()[0]}`);
	//         }
	//     }}
	// >
	// <box className={"stats container"} spacing={10} vertical>
	//     {[systemStats(), wifi, wired]}
	// </box>
	// </window>
}
