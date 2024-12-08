#!/usr/bin/gjs -m

import "./globals"
import { App, Gdk } from "astal/gtk3";
import monitorStyle from "./cssHotLoad";

monitorStyle;

// import {
// 	Bar,
// 	cliphist,
// 	Dashboard,
// 	Launcherflowbox,
// 	Launchergrid,
// 	MediaPlayerWindow,
// 	NotificationPopups,
// 	// Overview,
// 	sessioncontrol,
// 	SystemStats,
// 	wallpapers,
// } from "./modules/Windows/index";

import windows from "./modules/Windows/index";

// const monitorID = Gdk.Display.get_default()!.get_n_monitors() - 1

App.start({
	requestHandler(request: string, res: (response: any) => void) {
		for (const monitor of App.get_monitors()) {
			if (request == "dashboard") {
				const win = App.get_window(`dashboard${monitor}`)
				if (win && win.visible) {
					win.visible = false;
					res("Hiding Dashboard");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Showing Dashboard");
				}
			}
			if (request == "cliphist") {
				const win = App.get_window(`cliphist${monitor}`)
				if (win && win.visible) {
					win.visible = false;
					res("Hiding Cliphist");
				} else if (win && !win.visible) {
					win.visible = true
					res("Showing Cliphist");
				}
			}
			if (request == "wallpapers") {
				const win = App.get_window(`wallpapers${monitor}`)
				if (win && win.visible) {
					win.visible = false;
					res("Showing Wallpapers");
				} else if (win && !win.visible) {
					win.visible = true
					res("Hiding Wallpapers");
				}
			}
			if (request == "mediaplayerwindow") {
				const win = App.get_window(`mediaplayerwindow${monitor}`)
				if (win && win.visible) {
					win.visible = false;
					res("Showing mediaplayerwindow");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Hiding mediaplayerwindow");
				}
			}
			if (request == "sessioncontrol") {
				const win = App.get_window(`sessioncontrol${monitor}`)
				if (win && win.visible) {
					win.visible = false;
					res("Showing sessioncontrol");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Hiding sessioncontrol");
				}
			}
			if (request == "systemstats") {
				const win = App.get_window(`systemstats${monitor}`)
				if (win && win.visible) {
					win.visible = false;
					res("Showing systemstats");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Hiding systemstats");
				}
			}
			if (request == "launcher") {
				const win = App.get_window(`launcher${monitor}`)
				if (win && win.visible) {
					win.visible = false;
					res("Showing Launcher");
				} else if (win && !win.visible) {
					win.visible = true;
					res("Hiding Launcher");
				}
			}
		}
	},
	main() {
		for (const monitor of App.get_monitors()) {
			windows.forEach((window) => window(monitor));
			// Bar(monitor);
			// cliphist(monitor);
			// Dashboard(monitor);
			// // Launcherflowbox(monitor);
			// Launchergrid(monitor);
			// MediaPlayerWindow();
			// NotificationPopups(monitor);
			// sessioncontrol(monitor);
			// SystemStats(monitor);
			// wallpapers(monitor);
		}


	},
});

// App.get_monitors().map(Bar)