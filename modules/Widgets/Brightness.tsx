import { bind, exec, execAsync, monitorFile, Variable } from "astal";
import Icon from "../lib/icons";
import Pango from "gi://Pango";

const BrightLevel = Icon.brightness.levels;

function getIconForBrightness(value: number) {
	const brightnessLevels = Object.values(BrightLevel);
	for (let i = 0; i < brightnessLevels.length - 1; i++) {
		if (value < (i + 1) * 15) {
			return brightnessLevels[i];
		}
	}
	return brightnessLevels[brightnessLevels.length - 1];
}

function getValue() {
	try {
		const output = exec("light -G").trim();
		const brightness = parseFloat(output);
		if (!isNaN(brightness)) {
			return brightness;
		}
	} catch (error) {
		console.error("Error fetching brightness:", error);
	}
	return 0;
}


let currentBrightness = Variable(getValue() || 0);
let currentIcon = BrightLevel.b1;

export default function BrightnessSlider() {

	function initializeValues() {
		const brightness = getValue();
		if (!isNaN(brightness) && brightness >= 0 && brightness <= 100) {
			currentBrightness = Variable(brightness);
			currentIcon = getIconForBrightness(brightness);

			slider.value = brightness;
			theIcon.icon = currentIcon;
		} else {
			console.warn("Invalid brightness value:", brightness);
			slider.value = 0; // Fallback value
		}
	}

	monitorFile("/sys/class/backlight/intel_backlight/actual_brightness", () => {
		const brightness = getValue();
		if (!isNaN(brightness) && brightness >= 0 && brightness <= 100) {
			currentBrightness = Variable(brightness);
			currentIcon = getIconForBrightness(brightness);
			theIcon.icon = currentIcon;
			slider.value = brightness;
		} else {
			console.warn("Invalid brightness update:", brightness);
		}
	});

	const slider = (
		<slider
			className={"Slider"}
			hexpand={true}
			drawValue={false}
			min={0}
			max={100}
			value={bind(currentBrightness)}
			visible={true}
			onDragged={({ value }) => {
				execAsync(`light -S ${value}`).catch();
				const newIcon = getIconForBrightness(value);
				if (currentIcon !== newIcon) {
					currentIcon = newIcon;
					theIcon.icon = newIcon;
				}
			}}
		/>
	);

	const theTitle = <label className={"header"} wrap={false} hexpand={true}
		halign={CENTER} xalign={0} yalign={0} ellipsize={Pango.EllipsizeMode.END} label="Brightness" />;

	const theIcon = <icon halign={START} valign={CENTER} icon={getIconForBrightness(getValue())} />;

	setTimeout(initializeValues, 0);

	return (
		<box className={"brightness"} halign={FILL} valign={FILL} vertical={true} spacing={5}>
			{theTitle}
			<box halign={CENTER} valign={CENTER} spacing={10}>
				{theIcon}
				{slider}
			</box>
		</box>
	);
}
