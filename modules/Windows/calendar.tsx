/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { execAsync } from "astal";
import { GridCalendar } from "../Widgets/index";

export default function Calendar() {
	return (
		<window
			name={"calendar"}
			className={"window calendar"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.TOP}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
		>
			<eventbox
				onKeyPressEvent={(_, event) => {
					if (event.get_keyval()[1] === Gdk.KEY_Escape) {
						App.toggle_window("calendar");
					}
				}}
			>
				<box className={"calendarbox"}>
					<GridCalendar />
				</box>
			</eventbox>
		</window>
	);
}
