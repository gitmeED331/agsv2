import { opt, mkOptions } from "./modules/lib/option"
import Icon, { Icons } from "./modules/lib/icons"

const options = mkOptions(OPTIONS, {
	transition: opt(200),

	font: {
		size: opt(10),
		name: opt("Liberation Mono Font"),
	},

	bar: {
		flatButtons: opt(false),
		position: opt<"top" | "bottom">("top"),
		workspaces: {
			workspaces: opt(8),
		},
		battery: {
			bar: opt<"hidden" | "regular" | "whole">("regular"),
			charging: opt("#00D787"),
			percentage: opt(true),
			blocks: opt(10),
			width: opt(30),
			low: opt(30),
		},

		systray: {
			stitem: opt(false),
			ignore: opt([
			]),
		},
	},

	launcher: {
		width: opt(0),
		margin: opt(60),
		sh: {
			max: opt(16),
		},
		apps: {
			iconSize: opt(32),
			max: opt(6),
			favorites: opt([
				[
					"vivaldi",
					"konsole",
					"pcmanfm-qt",
					"deezer-enhanced",
				],
			]),
		},
	},

	layout: {
		start: opt<Array<import("./widgedt/Bar").BarWidget>>([
			"workspaces",
			"title",
		]),
		center: opt<Array<import("./widgedt/Bar").BarWidget>>([
			"media",
		]),
		end: opt<Array<import("./widgedt/Bar").BarWidget>>([
			"systray",
			"sysinfo",
			"dashbtn",
		]),
	},

	overview: {
		scale: opt(15),
		workspaces: opt(4),
		monochrome: opt(true),
	},

	datewin: {
		position: opt<Array<"top" | "bottom" | "left" | "right">>(["top", "left"]),
	},

	playwin: {
		position: opt<Array<"top" | "bottom" | "left" | "right">>(["top", "right"]),
	},

	dashvol: {
		position: opt<Array<"top" | "bottom" | "left" | "right">>(["top", "right"]),
	},

	dashboard: {
		position: opt<Array<"top" | "bottom" | "left" | "right">>(["top", "bottom", "right"]),
		networkSettings: opt("gtk-launch nm-connection-editor"),
	},

	pwrmenu: {
		lock: opt("bash -c 'exec ags -b lockscreen -c ~/.config/ags/Lockscreen/lockscreen.js'"),
		reboot: opt("systemctl reboot"),
		logout: opt("bash -c 'exec  ~/.config/hypr/scripts/hyprkill.sh >/dev/null 2>&1 &'"),
		shutdown: opt("systemctl -i poweroff"),
		layout: opt<"line" | "box">("line"),
		labels: opt(true),
		position: opt<Array<"top" | "bottom" | "left" | "right">>(["top", "right", "left", "bottom"]),
	},

	ssrmenu: {
		AShot: opt("bash -c" + "exec '" + "grim -g " + '"$(slurp)"' + " ~/Pictures/Screenshots/Screenshot-area_$(date +%Y-%m-%d_%H%M-%S).png'"),
		FShot: opt("bash -c 'grim ~/Pictures/Screenshots/Screenshot-full_$(date +%Y-%m-%d_%H%M-%S).png'"),
		//WShot: opt(""),
		ARecord: opt("bash -c" + "exec '" + "wf-recorder -g " + '"$(slurp)"' + " -f ~/Pictures/Screenshots/Screenrecording-area_$(date +%Y-%m-%d_%H-%M-%S).mp4'"),
		FRecord: opt("bash -c 'exec wf-recorder -f ~/Pictures/Screenshots/Screenrecording-full_$(date +%Y-%m-%d_%H%M-%S).mp4'"),
		//WRecord: opt(""),
		layout: opt<"line" | "box">("line"),
		labels: opt(true),
		position: opt<Array<"top" | "bottom" | "left" | "right">>(["top"]),
	},

	pwrprof: {
		profile: {
			performance: opt("performance"),
			balanced: opt("balanced"),
			powerSaver: opt("power-saver"),
		},
		light: {
			performance: opt("light -S 100"),
			balanced: opt("light -S 60"),
			powerSaver: opt("light -S 30"),
		},
		position: opt<Array<"top" | "bottom" | "left" | "right">>(["top", "right"]),
		layout: opt<"line" | "box">("line"),
		labels: opt(true),
	},

	notifications: {
		position: opt<Array<"top" | "bottom" | "left" | "right">>(["top", "right"]),
		width: opt(440),
		blacklist: opt([
			"Synology",

		]),
	},
})

globalThis["options"] = options
export default options
