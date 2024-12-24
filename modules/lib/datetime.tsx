import { Widget } from "astal/gtk3";
import { Variable, GLib } from "astal";

export default function DateTimeLabel({ format, interval, ...props }: { format: string, interval?: number | undefined | null } & Widget.LabelProps) {

	const shouldPoll = typeof interval === "number" && interval >= 1;

	const currentTime = () => {
		const dateTime = GLib.DateTime.new_now_local();
		return dateTime.format(format) as string;
	}

	if (shouldPoll) {
		const pollTime = new Variable(currentTime()).poll(interval || 1000, currentTime);
		return <label label={pollTime()} {...props} />
	} else if (interval === null || interval === undefined) {
		const time = new Variable(currentTime())
		return <label label={time()} {...props} />
	} else {
		const time = new Variable(currentTime())
		return <label label={time()} {...props} />
	}
}