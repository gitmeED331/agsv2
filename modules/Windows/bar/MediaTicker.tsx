/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { Variable, bind, GLib } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";

import TrimTrackTitle from "../../lib/TrimTrackTitle";
import Icon from "../../lib/icons";
import { Stack } from "../../Astalified/index";

function tickerButton(player: Mpris.Player) {
	const TickerTrack = (
		<label
			className={"ticker track"}
			vexpand={true}
			wrap={false}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			ellipsize={Pango.EllipsizeMode.END}
			maxWidthChars={35}
			label={bind(player, "title").as((title) => TrimTrackTitle(title))}
		/>
	);

	const TickerArtist = (
		<label
			className={"ticker artist"}
			wrap={false}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			ellipsize={Pango.EllipsizeMode.END}
			// maxWidthChars={35}
			label={bind(player, "artist").as((artist) => artist || "Unknown Artist")}
		/>
	);

	const TickerIcon = (
		<icon
			className={"ticker icon"}
			hexpand={false}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			tooltip_text={bind(player, "identity")}
			icon={bind(player, "entry").as((entry) => entry || Icon.mpris.controls.FALLBACK_ICON)}
		/>
	);

	return (
		<button
			name={player.busName}
			vexpand={false}
			hexpand={true}
			cursor={"pointer"}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const win = App.get_window("mediaplayerwindow");
					if (win) {
						win.visible = !win.visible;
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					player.play_pause();
				}

				// if (event.button === Gdk.BUTTON_MIDDLE) {
				// }
			}}
			onScroll={(_, { delta_y }) => {
				if (delta_y < 0) {
					player.previous();
				} else {
					player.next();
				}
			}}
		>
			<box visible={true} spacing={5} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
				{[TickerTrack, TickerIcon, TickerArtist]}
			</box>
		</button>
	);
}

export default function MediaTickerButton() {
	const mpris = Mpris.get_default();
	const theStack = (
		<Stack
			visible={true}
			transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
			transition_duration={2000}
			homogeneous={false}
			setup={(self) => {

				const addNoMediaPage = () => {
					let noMediaLabel = self.get_child_by_name("no-media");
					if (!noMediaLabel) {
						noMediaLabel = (
							<label
								className={"ticker nomedia"}
								name={"no-media"}
								hexpand={true}
								wrap={false}
								halign={Gtk.Align.CENTER}
								valign={Gtk.Align.CENTER}
								label={"No Media"}
							/>
						);
						self.add_named(noMediaLabel, "no-media");
					}
					noMediaLabel.visible = true;
					self.set_visible_child_name("no-media");
				};

				const removeNoMediaPage = () => {
					const noMediaChild = self.get_child_by_name("no-media");
					if (noMediaChild) {
						noMediaChild.visible = false;
					}
				};

				const updateNoMediaState = () => {
					const players = mpris.get_players();
					players.length === 0 ? addNoMediaPage() : removeNoMediaPage();
				};

				mpris.get_players()?.forEach((p) =>
					self.add_named(tickerButton(p), p.busName)
				);

				updateNoMediaState();

				mpris.connect("player-added", (_, p) => {
					const childName = p.busName;
					if (!self.get_child_by_name(childName)) {
						self.add_titled(tickerButton(p), childName, childName.toUpperCase());
					}
					updateNoMediaState();
				});

				mpris.connect("player-closed", (_, p) => {
					const childName = p.busName;
					const child = self.get_child_by_name(childName);
					if (child) {
						child.destroy();
					}

					updateNoMediaState();
				});

				setInterval(() => {
					const visiblePages = self
						.get_children()
						.filter((child) => child.visible);

					if (visiblePages.length === 0) {
						addNoMediaPage();
					} else if (visiblePages.length >= 1) {
						const currentChild = self.get_visible_child_name();
						const currentIndex = visiblePages.findIndex(
							(child) => child.name === currentChild
						);
						const nextIndex = (currentIndex + 1) % visiblePages.length;
						self.set_visible_child_name(visiblePages[nextIndex].name);
					}
				}, 7500);
			}}
		/>
	);

	return (
		<box className={"ticker container"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
			{theStack}
		</box>
	);
}
