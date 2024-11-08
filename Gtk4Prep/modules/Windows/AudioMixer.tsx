/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { AudioMixer } from "../Widgets/index";

export default () => (
	<window
		name={"audiomixerwindow"}
		cssClasses={"window audiomixer"}
		anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
		layer={Astal.Layer.OVERLAY}
		exclusivity={Astal.Exclusivity.NORMAL}
		keymode={Astal.Keymode.EXCLUSIVE}
		visible={false}
		application={App}
	>
		<eventbox
			onKeyPressed={(_, event) => {
				if (event.get_keyval() === Gdk.KEY_Escape) {
					App.toggle_window("audiomixerwindow");
				}
			}}
		>
			<AudioMixer />
		</eventbox>
	</window>
);
