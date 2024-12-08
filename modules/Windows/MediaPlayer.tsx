import { App, Astal, Gdk } from "astal/gtk3";
import playerStack, { windowPlayerStack } from "../Widgets/MediaPlayer";

//const player = Mpris.Player.new("Deezer");

export default function MediaPlayerWindow(monitor: Gdk.Monitor) {
	const WINDOWNAME = `mediaplayerwindow${monitor}`;

	App.connect("window-toggled", (_, win) => {
		if (win.visible === false && win.name === WINDOWNAME) {
			if (windowPlayerStack.get_visible_child_name() !== "org.mpris.MediaPlayer2.Deezer" && windowPlayerStack.get_visible_child_name() !== "no-media" && windowPlayerStack.length > 0) {
				windowPlayerStack.set_visible_child_name("org.mpris.MediaPlayer2.Deezer");
			}
		}
	});

	return (
		<window
			name={WINDOWNAME}
			className={"window media-player"}
			anchor={TOP | RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			margin-right={90}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window(WINDOWNAME);
				if (event.get_keyval()[1] === Gdk.KEY_Escape) {
					if (win && win.visible === true) {
						win.visible = false;
					}
				}
			}}
		>
			{playerStack()}
		</window>
	);
}