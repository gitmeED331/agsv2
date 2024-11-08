/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { Variable, bind } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";

import TrimTrackTitle from "../../lib/TrimTrackTitle";
import Icon from "../../lib/icons";

const player = Mpris.Player.new("Deezer"); //"Deezer"  "vlc" "mpv";

function TickerTrack() {
	return (
		<label
			cssClasses={"ticker track"}
			wrap={false}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			ellipsize={Pango.EllipsizeMode.END}
			label={bind(player, "title").as((title) => TrimTrackTitle(title))}
		/>
	);
}

function TickerArtist() {
	return (
		<label
			cssClasses={"ticker artist"}
			wrap={false}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			ellipsize={Pango.EllipsizeMode.END}
			maxWidthChars={35}
			label={bind(player, "artist").as((artist) => artist || "Unknown Artist")}
		/>
	);
}

function TickerIcon() {
	return (
		<icon
			cssClasses={"ticker icon"}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			tooltip_text={bind(player, "identity")}
			icon={bind(player, "entry").as((entry) => entry || Icon.mpris.controls.FALLBACK_ICON)}
		/>
	);
}

const NoMedia = <label cssClasses={"ticker nomedia"} wrap={false} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} label={"No Media"} />;

function MediaTickerButton() {
	return (
		<button
			cssClasses={"ticker container"}
			onClicked={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const win = App.get_window("mediaplayerwindow");
					if (win) {
						win.visible = !win.visible;
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					player.play_pause();
				}
				// Additional click actions can be added here
			}}
			onScroll={(_, { delta_y }) => {
				if (delta_y < 0) {
					player.previous();
				} else {
					player.next();
				}
			}}
		>
			{bind(player, "playbackStatus").as((status) => {
				switch (status) {
					case Mpris.PlaybackStatus.STOPPED:
						return NoMedia;
					case Mpris.PlaybackStatus.PLAYING:
					case Mpris.PlaybackStatus.PAUSED:
						return (
							<box vertical={false} spacing={5}>
								<TickerTrack />
								<TickerIcon />
								<TickerArtist />
							</box>
						);
					default:
						return NoMedia;
				}
			})}
		</button>
	);
}

export default MediaTickerButton;
