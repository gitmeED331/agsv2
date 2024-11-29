#!/usr/bin/gjs -m

/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */
import "./globals"
import { App, Gdk } from "astal/gtk3";
import monitorStyle from "./cssHotLoad";

monitorStyle;

import {
	Bar,
	cliphist,
	Dashboard,
	Launcherflowbox,
	Launchergrid,
	MediaPlayerWindow,
	NotificationPopups,
	// Overview,
	sessioncontrol,
	SystemStats,
	wallpapers,
} from "./modules/Windows/index";

const monitorID = Gdk.Display.get_default()!.get_n_monitors() - 1

App.start({
	main() {
		for (const monitor of App.get_monitors()) {
			Bar(monitor);
			cliphist(monitor);
			Dashboard(monitor);
			// Launcherflowbox(monitor);
			Launchergrid(monitor);
			MediaPlayerWindow();
			NotificationPopups(monitor);
			sessioncontrol(monitor);
			SystemStats(monitor);
			wallpapers(monitor);
		}


	},
});