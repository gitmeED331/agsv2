import { Astal, Gdk, App } from "astal/gtk3";
import { GLib } from "astal";
import { SessionControls } from "../Widgets/index";
import PopupWindow from "../lib/popupwindow";

// const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

export default (monitor: Gdk.Monitor) => {
	const WINDOWNAME = `sessioncontrols${monitor.get_model()}`;

	// function CTC(id: number, width: number) {
	// 	return <ClickToClose id={id} width={width} height={0.25} windowName={WinName} />;
	// }

	// const theGrid = (
	// 	<Grid
	// 		halign={FILL}
	// 		valign={FILL}
	// 		expand
	// 		visible={true}
	// 		setup={(self) => {
	// 			self.attach(, 2, 2, 1, 1);

	// 			self.attach(CTC(1, 1), 1, 1, 3, 1);
	// 			self.attach(CTC(2, 0.2), 1, 2, 1, 1);
	// 			self.attach(CTC(3, 0.2), 3, 2, 1, 1);
	// 			self.attach(CTC(4, 1), 1, 3, 3, 1);
	// 		}}
	// 	/>
	// );

	return (
		<PopupWindow name={WINDOWNAME} className={"sessioncontrols window"} exclusivity={Astal.Exclusivity.NORMAL} xcoord={0.26} ycoord={0.3} child={<SessionControls />} transition={REVEAL_CROSSFADE} />
	);

	// return <window
	// 	name={WinName}
	// 	className={"sessioncontrols window"}
	// 	gdkmonitor={monitor}
	// 	anchor={TOP | BOTTOM | LEFT | RIGHT}
	// 	layer={Astal.Layer.OVERLAY}
	// 	exclusivity={Astal.Exclusivity.IGNORE}
	// 	keymode={Astal.Keymode.EXCLUSIVE}
	// 	visible={false}
	// 	application={App}
	// 	onKeyPressEvent={(_, event) => {
	// 		if (event.get_keyval()[1] === Gdk.KEY_Escape) {
	// 			App.toggle_window(WinName);
	// 		}
	// 	}}
	// >
	// 	{theGrid}
	// </window>;
};
