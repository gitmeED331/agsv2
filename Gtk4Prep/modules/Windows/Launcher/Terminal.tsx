import { Gtk } from "astal/gtk4";
import { GLib } from "astal";
import Vte from "gi://Vte?version=2.91";

export default function terminal() {
	const term = new Vte.Terminal({
		visible: true,
		expand: true,
		inputEnabled: true,
		cursorBlinkMode: Vte.CursorBlinkMode.SYSTEM,
		cursorShape: Vte.CursorShape.IBEAM,
	});

	const shellPath = "/bin/bash";  // Fallback shell
	const homeDirectory = GLib.get_home_dir();

	term.spawn_async(
		Vte.PtyFlags.DEFAULT,
		homeDirectory,
		[shellPath],
		null,
		GLib.SpawnFlags.SEARCH_PATH,
		null,
		null,
		null,
		(error, pid) => {
			if (error) {
				console.error(`Error spawning process: ${error.message}`);
			} else {
				console.log(`Process spawned successfully with PID ${pid}`);
				term.watch_child(pid);
			}
		}
	);

	return (
		<box
			name="Terminal"
			expand
		>
			{term}
		</box>
	);
}
