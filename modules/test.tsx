import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, Binding, execAsync, Variable } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";

const getAccentColor = async (cover_art: string): Promise<string> => {
	const accent = (color: string): string => `color: ${color};`;

	if (cover_art) {
		const color = await execAsync(`bash -c "magick ${cover_art} -colors 2 -quantize RGB -unique-colors txt:- | awk '{ print $3 }' | tail -n 1"`);
		return accent(color);
	}
	return "color: #000000";
};

export default function Player({ p }: { p: Mpris.Player }) {
	async function setup(CP: Widget.CircularProgress) {
		CP.css = await getAccentColor(p.cover_art);
		CP.hook(p, "notify::cover-art", async () => {
			CP.css = await getAccentColor(p.cover_art);
		});
	}
	const playerLabel = Variable.derive([bind(p, "title"), bind(p, "artist")], (title, artist) => {
		return `${artist} - ${title}` || title ;
	});
	return (
		<box spacing={5}>
			<circularprogress
				halign={CENTER}
				valign={CENTER}
				startAt={0.75}
				endAt={0.75}
				rounded
				value={bind(p, "position").as((pos) => (p ? pos / p.length : 1))}
				setup={setup}
				widthRequest={100}
				heightRequest={100}
			>
				<icon icon={bind(p, "playbackStatus").as((status) => (status === Mpris.PlaybackStatus.PLAYING ? "media-playback-pause" : "media-playback-start"))} />
			</circularprogress>
			<label label={bind(playerLabel).as((pl) => pl || "")} truncate maxWidthChars={40} ellipsize={Pango.EllipsizeMode.END} />
		</box>
	);
}
