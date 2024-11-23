import { GLib } from "astal";

export function Time(time: number, format = "%H:%M") {
	return GLib.DateTime.new_from_unix_local(time).format(format);
}
export function Date(date: number, format = "%b %d") {
	return GLib.DateTime.new_from_unix_local(date).format(format);
}
