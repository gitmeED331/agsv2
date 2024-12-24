import { App, Astal, Gdk } from "astal/gtk3";
import playerStack, { windowPlayerStack } from "../Widgets/MediaPlayer";
import Mpris from "gi://AstalMpris";
import PopupWindow from "../lib/popupwindow";

//const player = Mpris.Player.new("Deezer");

export default function MediaPlayerWindow(monitor: Gdk.Monitor) {
	const WINDOWNAME = `mediaplayerwindow${monitor.get_model()}`;

	App.connect("window-toggled", (_, win) => {
		const Stack = windowPlayerStack.get_visible_child_name();
		if (win.name === WINDOWNAME) {
			switch (win.visible) {
				case true:
					console.log("player window true section");
					Mpris.get_default().get_players().length === 0 ? (win.visible = false) : null;
				case false:
					Stack !== "org.mpris.MediaPlayer2.Deezer" && Stack !== "no-media" && windowPlayerStack.get_children().length > 0
						? windowPlayerStack.set_visible_child_name("org.mpris.MediaPlayer2.Deezer")
						: null;
			}
		}
	});

	return <PopupWindow name={WINDOWNAME} className={"window media-player"} exclusivity={Astal.Exclusivity.NORMAL} xcoord={0.7} ycoord={0.05} child={playerStack()} transition={REVEAL_CROSSFADE} />;
	// return (
	// 	<window
	// 		name={WINDOWNAME}
	// 		className={"window media-player"}
	// 		anchor={TOP | RIGHT}
	// 		layer={Astal.Layer.OVERLAY}
	// 		exclusivity={Astal.Exclusivity.NORMAL}
	// 		keymode={Astal.Keymode.EXCLUSIVE}
	// 		visible={false}
	// 		application={App}
	// 		margin-right={90}
	// 		onKeyPressEvent={(_, event) => {
	// 			const win = App.get_window(WINDOWNAME);
	// 			if (event.get_keyval()[1] === Gdk.KEY_Escape) {
	// 				if (win && win.visible === true) {
	// 					win.visible = false;
	// 				}
	// 			}
	// 		}}
	// 	>
	// 		{playerStack()}
	// 	</window>
	// );
}
