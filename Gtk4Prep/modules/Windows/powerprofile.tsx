/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, App, Gdk } from "astal/gtk4";
import { PowerProfiles } from "../Widgets/index";

export default () => (
	<window
		name={"powerprofiles"}
		cssClasses={"pwrprofiles window"}
		anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.TOP}
		layer={Astal.Layer.OVERLAY}
		exclusivity={Astal.Exclusivity.NORMAL}
		keymode={Astal.Keymode.EXCLUSIVE}
		visible={false}
		application={App}
		onKeyPressEvent={(_, event) => {
			if (event.get_keyval()[1] === Gdk.KEY_Escape) {
				App.toggle_window("powerprofiles");
			}
		}}
	>
		<PowerProfiles />
	</window>
);
