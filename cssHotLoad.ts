import { App } from "astal/gtk3";
import { execAsync, monitorFile } from "astal";

/* CSS Hot Reload */
async function monitorStyle() {
	const pathsToMonitor = [ // Paths to monitor
		`${SRC}/style/globals`,
		`${SRC}/style/components`,
		`${SRC}/style/variables.scss`
	];

	const mainScss = `${SRC}/style/main.scss`; // SCSS input file to compile
	const css = `/tmp/style.css`; // CSS output file

	let isApplying = false;

	async function transpileAndApply() {
		if (isApplying) return;
		isApplying = true;

		try {
			await execAsync(`sass ${mainScss} ${css}`);
			App.apply_css(css, true);
			print("CSS applied successfully!");
		} catch (error) {
			print("Error transpiling SCSS:", error);
			execAsync(`notify-send -u critical "Error transpiling SCSS" "${error}"`);
		} finally {
			isApplying = false;
		}
	}

	pathsToMonitor.forEach((path) => monitorFile(path, transpileAndApply));

	return transpileAndApply();
}

export default monitorStyle();
