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
import { App } from "astal/gtk3";
import monitorStyle from "./cssHotLoad";

monitorStyle;

import {
	Bar,
	Dashboard,
	Launcherflowbox,
	Launchergrid,
	MediaPlayerWindow,
	NotificationPopups,
	// Overview,
	sessioncontrol,
	cliphist,
	wallpapers,
} from "./modules/Windows/index";

App.start({
	main() {
		Bar({ monitor: 0 });
		cliphist({ monitor: 0 });
		Dashboard({ monitor: 0 });
		// Launcherflowbox({ monitor: 0 });
		Launchergrid({ monitor: 0 });
		MediaPlayerWindow();
		NotificationPopups({ monitor: 0 });
		sessioncontrol({ monitor: 0 });
		wallpapers();
	},
});