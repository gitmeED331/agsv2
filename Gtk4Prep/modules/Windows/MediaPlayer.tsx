/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { App, Astal, Gdk } from "astal/gtk4";
import Mpris from "gi://AstalMpris";
import { Player } from "../Widgets/index";

const player = Mpris.Player.new("Deezer");

export default function MediaPlayerWindow() {
	return (
		<window
			name={"mediaplayerwindow"}
			cssClasses={"window media-player"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			marginEnd={90}
			onKeyPressed={(_, event) => {
				const win = App.get_window("mediaplayerwindow");
				if (event.get_keyval() === Gdk.KEY_Escape && win?.visible) {
					win.visible = false;
				}
			}}
		>
			<box cssClasses={"mediaplayerbox"}>
				<Player player={player} />
			</box>
		</window>
	);
}
