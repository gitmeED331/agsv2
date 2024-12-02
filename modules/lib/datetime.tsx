import { Variable, GLib } from "astal";

export default function DateTimeLabel({ format, interval }: { format: string, interval?: number | undefined | null }) {

	const shouldPoll = typeof interval === "number" && interval >= 1;

	const currentTime = () => {
		const dateTime = GLib.DateTime.new_now_local();
		return dateTime.format(format) as string;
	}

	if (shouldPoll) {
		const pollTime = new Variable(currentTime()).poll(interval || 1000, currentTime);
		return <label label={pollTime()} />
	} else if (interval === null || interval === undefined) {
		const time = new Variable(currentTime())
		return <label label={time()} />
	} else {
		const time = new Variable(currentTime())
		return <label label={time()} />
	}
}