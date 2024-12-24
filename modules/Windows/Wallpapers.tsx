import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { execAsync, GLib } from "astal";
import { Grid, Spinner } from "../Astalified/index";
import ScreenSizing from "../lib/screensizeadjust";
import Icon from "../lib/icons";
import PopupWindow from "../lib/popupwindow";

const originalPath = `${GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES)}/Wallpapers`;
const cacheDir = "/tmp/wallpaper_cache";
const shellScriptPath = `${SRC}/scripts/scale_and_cache_images.sh`;
const columnCount = 5;

const WINDOWNAME = `wallpapers${App.get_monitors()[0].get_model()}`;

GLib.mkdir_with_parents(cacheDir, 0o755);

async function getCachedImagePath(wallpaperPath: string, width: number, height: number): Promise<string> {
	const stdout = await execAsync(`${shellScriptPath} "${wallpaperPath}" ${width} ${height}`);
	return stdout.trim();
}

async function getWallpapers(): Promise<Array<{ name: string; path: string; originalPath: string }>> {
	const stdout = await execAsync(`${shellScriptPath}`);
	const paths = stdout
		.trim()
		.split("\n")
		.filter((path) => path.trim() !== "");

	return paths.map((path) => ({
		name: path.split("/").pop() || "Unknown",
		path,
		originalPath: path.replace(cacheDir, originalPath),
	}));
}

async function createWallpaperGrid(wps: Array<{ name: string; path: string; originalPath: string }>) {
	const grid = (
		<Grid
			hexpand={true}
			vexpand={false}
			halign={FILL}
			valign={FILL}
			rowHomogeneous={true}
			columnHomogeneous={true}
			row_spacing={10}
			column_spacing={5}
			widthRequest={ScreenSizing({ type: "width", multiplier: 0.35 })}
			heightRequest={ScreenSizing({ type: "height", multiplier: 0.35 })}
			css={`
				padding: 1rem;
			`}
			setup={async (self) => {
				for (const [index, wp] of wps.entries()) {
					const cachedImagePath = await getCachedImagePath(wp.originalPath, ScreenSizing({ type: "width", multiplier: 0.05 }), ScreenSizing({ type: "height", multiplier: 0.05 }));
					const wpButton = (
						<button
							className={"launcher app"}
							name={wp.name}
							tooltip_text={wp.name}
							on_clicked={() => {
								execAsync(`swww img "${wp.originalPath}"`);
								App.toggle_window(WINDOWNAME);
							}}
							widthRequest={ScreenSizing({ type: "width", multiplier: 0.1 })}
							heightRequest={ScreenSizing({ type: "height", multiplier: 0.1 })}
							halign={CENTER}
							valign={CENTER}
						>
							<box
								className={"wallpaper image"}
								halign={FILL}
								valign={FILL}
								css={`
									background-image: url("${cachedImagePath}");
									background-size: cover;
									background-repeat: no-repeat;
									border-radius: 3rem;
								`}
							/>
						</button>
					);
					self.attach(wpButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
				}
			}}
		/>
	);

	return grid;
}

async function updateWallpaperGrid(wallpaperGrid: Grid, wallpapers: Array<{ name: string; path: string; originalPath: string }>) {
	const sortedWallpapers = wallpapers.sort((a, b) => a.name.localeCompare(b.name));

	wallpaperGrid.get_children().forEach((child) => {
		wallpaperGrid.remove(child);
	});

	for (const [index, wp] of sortedWallpapers.entries()) {
		const cachedImagePath = await getCachedImagePath(wp.originalPath, ScreenSizing({ type: "width", multiplier: 0.05 }), ScreenSizing({ type: "height", multiplier: 0.05 }));

		const wpButton = (
			<button
				className={"launcher app"}
				name={wp.name}
				tooltip_text={wp.name}
				on_clicked={() => {
					const win = App.get_window(WINDOWNAME);
					execAsync(`swww img "${wp.originalPath}"`);
					if (win && win.visible) {
						win.visible = false;
					}
				}}
				widthRequest={ScreenSizing({ type: "width", multiplier: 0.1 })}
				heightRequest={ScreenSizing({ type: "height", multiplier: 0.1 })}
				halign={CENTER}
				valign={CENTER}
			>
				<box
					className={"wallpaper image"}
					halign={FILL}
					valign={FILL}
					css={`
						background-image: url("${cachedImagePath}");
						background-size: cover;
						background-repeat: no-repeat;
						border-radius: 3rem;
					`}
				/>
			</button>
		);

		wallpaperGrid.attach(wpButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
	}

	wallpaperGrid.show_all();
}

function createRefreshButton(wallpaperGrid: Grid) {
	const theSpinner = (<Spinner halign={CENTER} valign={CENTER} visible={false} />) as Spinner;

	const handleClick = () => {
		execAsync(`notify-send "Refreshing" "Starting wallpaper refresh process."`);
		console.log("Refresh button clicked.");

		RefreshButton.hide();
		theSpinner.show();
		theSpinner.start();

		execAsync(`${SRC}/scripts/refresh_wallpapers.sh`)
			.then(() => {
				execAsync(`notify-send "Refreshing" "Wallpaper refresh completed successfully."`);
				console.log("Wallpaper refresh script executed successfully.");
				return getWallpapers();
			})
			.then((wps) => {
				console.log(`Fetched ${wps.length} wallpapers after refresh.`);
				updateWallpaperGrid(wallpaperGrid, wps);
			})
			.catch((error) => {
				console.error(`Error refreshing wallpapers: ${error.message}`);
				execAsync(`notify-send "Error" "Wallpaper refresh failed: ${error.message}"`);
			})
			.finally(() => {
				RefreshButton.stop();
				RefreshButton.hide();
				RefreshButton.show();
				execAsync(`notify-send "Refreshing" "Refresh process ended."`);
				console.log("Refresh process completed.");
			});
	};

	const RefreshButton = (
		<button className={"refresh button"} tooltip_text={"Refresh Wallpapers"} on_clicked={handleClick} halign={START} valign={START}>
			<icon icon={Icon.ui.refresh} />
		</button>
	);

	const container = (
		<box hexpand={false} vexpand={false} halign={CENTER} valign={CENTER}>
			{theSpinner}
			{RefreshButton}
		</box>
	);

	return container;
}

async function createScrollablePage(wps: Array<{ name: string; path: string; originalPath: string }>) {
	const wallpaperGrid = await createWallpaperGrid(wps);
	const refreshButton = createRefreshButton(wallpaperGrid as Grid);
	return (
		<box css="background-color: rgba(0,0,0,0.75); border: 2px solid rgba(15,155,255,1); border-radius: 3rem; padding: 1rem;">
			<scrollable
				vscroll={Gtk.PolicyType.AUTOMATIC}
				hscroll={Gtk.PolicyType.NEVER}
				// vexpand={true}
				// hexpand={true}
				// halign={CENTER}
				// valign={CENTER}
				visible={true}
				widthRequest={ScreenSizing({ type: "width", multiplier: 0.35 })}
				heightRequest={ScreenSizing({ type: "height", multiplier: 0.35 })}
			>
				{wallpaperGrid}
			</scrollable>
			{refreshButton}
		</box>
	);
}

export default async function (monitor: Gdk.Monitor) {
	const wps = await getWallpapers();
	const Content = await createScrollablePage(wps);

	// const masterGrid = <Grid
	// 	hexpand={true}
	// 	vexpand={true}
	// 	halign={FILL}
	// 	valign={FILL}
	// 	visible={true}
	// 	setup={(self) => {

	// 		self.attach(<ClickToClose id={1} width={0.25} height={0.25} windowName="wallpapers" />, 0, 0, 3, 1); // Top
	// 		self.attach(<ClickToClose id={2} width={0.25} height={0.25} windowName="wallpapers" />, 0, 1, 1, 1); // Left

	// 		self.attach(gridContent, 1, 1, 1, 1);

	// 		self.attach(<ClickToClose id={3} width={0.25} height={0.25} windowName="wallpapers" />, 2, 1, 1, 1); // Right
	// 		self.attach(<ClickToClose id={4} width={0.25} height={0.25} windowName="wallpapers" />, 0, 2, 3, 1); // Bottom
	// 	}}
	// />

	return <PopupWindow name={`wallpapers${monitor.get_model()}`} exclusivity={Astal.Exclusivity.NORMAL} xcoord={0.23} ycoord={0.3} child={Content} transition={REVEAL_CROSSFADE} />;

	// return <window
	// 	name={`wallpapers${monitor}`}
	// 	className="wallpapers window"
	// 	gdkmonitor={monitor}
	// 	anchor={TOP | BOTTOM | LEFT | RIGHT}
	// 	layer={Astal.Layer.OVERLAY}
	// 	exclusivity={Astal.Exclusivity.NORMAL}
	// 	keymode={Astal.Keymode.EXCLUSIVE}
	// 	visible={false}
	// 	application={App}
	// 	onKeyPressEvent={(_, event) => {
	// 		if (event.get_keyval()[1] === Gdk.KEY_Escape) {
	// 			App.toggle_window(`wallpapers${App.get_monitors()[0]}`);
	// 		}
	// 	}}
	// >
	// 	{masterGrid}
	// </window>
}
