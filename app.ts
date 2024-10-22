#!/usr/bin/gjs -m
import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { GLib, execAsync, monitorFile } from "astal";

// import DirectoryMonitorService from "./modules/lib/DirectoryMonitorService";

// const Icons = `${GLib.get_user_data_dir()}/icons/Astal`
// const STYLEDIR = `${GLib.get_user_config_dir()}/ags/style`

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
	cliphist,
	wallpapers
} from "./modules/Windows/index";

App.start({
	css: style,
	main() {
		Bar({ monitor: 0 });
		cliphist({ monitor: 0 });
		Dashboard({ monitor: 0 });
		Launcher({ monitor: 0 });
		MediaPlayerWindow();
		NotificationPopups({ monitor: 0 });
		// Overview();
		sessioncontrol({ monitor: 0 });
		wallpapers();
	},
});
