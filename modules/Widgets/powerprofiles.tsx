import { Gdk, Widget } from "astal/gtk3";
import { execAsync, exec, bind, Variable } from "astal";
import Icon, { Icons } from "../lib/icons";
import AstalPowerProfiles from "gi://AstalPowerProfiles";

function currentBrightness() {
	return parseInt(exec("light -G").trim());
}

function PowerProfiles() {
	const powerprofile = AstalPowerProfiles.get_default();

	powerprofile.connect("notify::active-profile", () => {
		const brightnessLevels: { [key: string]: number } = {
			"power-saver": 20,
			balanced: 50,
			performance: 100,
		};

		const setBrightness = (level: number) => {
			execAsync(`light -S ${level}`);
		};

		const updateBrightness = () => {
			const level = brightnessLevels[powerprofile.activeProfile];
			setBrightness(level);
		};

		updateBrightness();
	});

	const SysButton = ({ action, ...props }: { action: "balanced" | "power-saver" | "performance" } & Widget.ButtonProps) => {
		const Bindings = Variable.derive([bind(powerprofile, "activeProfile"), bind(powerprofile, "get_profiles")], (activeProfile, profiles) => ({
			className: {
				"power-saver": activeProfile === action ? activeProfile : "",
				balanced: activeProfile === action ? activeProfile : "",
				performance: activeProfile === action ? activeProfile : "",
			}[action],

			label: {
				"power-saver": "Saver",
				balanced: "Balanced",
				performance: "Performance",
			}[action],
			command: {
				"power-saver": () => (powerprofile.activeProfile = "power-saver"),
				balanced: () => (powerprofile.activeProfile = "balanced"),
				performance: () => (powerprofile.activeProfile = "performance"),
			}[action],
			icon: {
				"power-saver": Icon.powerprofile["power-saver"],
				balanced: Icon.powerprofile.balanced,
				performance: Icon.powerprofile.performance,
			}[action],
		}))();
		return (
			<button
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						Bindings.get().command();
						currentBrightness();
					}
				}}
				className={Bindings.as((c) => c.className)}
				{...props}
			>
				<box vertical={true}>
					<icon icon={Bindings.as((i) => i.icon)} />
					<label label={Bindings.as((l) => l.label)} />
				</box>
			</button>
		);
	};

	return (
		<box className={"powerprofiles container"} name={"powerprofiles"} vertical={false} vexpand={false} hexpand={false} valign={CENTER} halign={CENTER}>
			<SysButton action="power-saver" />
			<SysButton action="balanced" />
			<SysButton action="performance" />
		</box>
	);
}

export default PowerProfiles;
