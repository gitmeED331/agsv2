#!/usr/bin/gjs -m
import { GLib, App, execAsync, monitorFile, Astal, Gtk } from "astal";
// import DirectoryMonitorService from "./modules/lib/DirectoryMonitorService";

// const Icons = `${GLib.get_user_data_dir()}/icons/Astal`
// const STYLEDIR = `${GLib.get_user_config_dir()}/astal-gjs/src/style`
// const DISTDIR = `${GLib.get_user_config_dir()}/astal-gjs/dist`

// const css = `${STYLEDIR}/style.css`
// const scss = `${STYLEDIR}/main.scss`

// function applyScss() {
//   const compileScss = () => {
//     execAsync(`sass ${scss} ${css}`);
//     console.log("Scss compiled");
//   };

//   const resetAndApplyCss = () => {
//     App.reset_css();
//     console.log("Reset");
//     App.apply_css(css);
//     console.log("Compiled css applied");
//   };

//   monitorFile(`${STYLEDIR}`, resetAndApplyCss);
// }

import style from "./style/main.scss";
import {
	Bar,
	Dashboard,
	MediaPlayerWindow,
	NotificationPopups,
	// Overview,
	sessioncontrol,
	Launcher,
	//  cliphist,
	WallpaperChooser
} from "./modules/Windows/index";

App.start({
	css: style,
	main() {
		Bar({ monitor: 0 });
		Dashboard();
		MediaPlayerWindow();
		NotificationPopups(0);
		// Overview();
		// sessioncontrol();
		Launcher();
		//  cliphist();
		WallpaperChooser();
	},
});
