/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { Variable, bind } from "astal";

export default function Clock() {
	const time = Variable("").poll(1000, 'date "+%H:%M:%S"');
	const date = Variable("").poll(3600000, 'date "+%a %b %d"');
	return (
		<box className={"clock"} halign={Gtk.Align.CENTER} valign={Gtk.Align.START} spacing={10}>
			<label label={bind(date)} halign={Gtk.Align.CENTER} />
			<label label={bind(time)} halign={Gtk.Align.CENTER} />
		</box>
	);
}
