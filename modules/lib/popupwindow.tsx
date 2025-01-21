/* Thank you to Jas for showing me how to do this */

import { bind, Variable } from "astal";
import { App, Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { WindowProps } from "astal/gtk3/widget";
import { Fixed } from "modules/Astalified/index";
import { Revealer } from "astal/gtk3/widget";
import ScreenSizing from "modules/lib/screensizeadjust";


type GlobalEventBoxes = {
	[key: string]: unknown;
};
export const globalEventBoxes: Variable<GlobalEventBoxes> = Variable({});

export interface PopupWindoProps extends WindowProps {
	name: string;
	child: Gtk.Widget;
	xcoord?: number;
	ycoord?: number;
	transition: Gtk.RevealerTransitionType;
	exclusivity?: Astal.Exclusivity;
	fixed?: boolean;
}

export default ({ name, child, xcoord, ycoord, transition, exclusivity = Astal.Exclusivity.IGNORE, ...props }: PopupWindoProps): JSX.Element => {
	return (
		<window
			name={name}
			className={`${name} popup`}
			onKeyPressed={(_, keyval) => {
				const win = App.get_window(name);
				if (win && win?.visible && keyval === Gdk.KEY_Escape) {
					win.visible = false;
				}
			}}
			visible={false}
			application={App}
			keymode={Astal.Keymode.ON_DEMAND}
			exclusivity={exclusivity}
			layer={Astal.Layer.TOP}
			anchor={TOP | BOTTOM | LEFT | RIGHT}
			{...props}
		>
			<eventbox
				halign={FILL}
				valign={FILL}
				onButtonPressEvent={(_, event) => {
					const buttonClicked = event.get_button()[1];
					const win = App.get_window(name);
					if ((win && win?.visible && buttonClicked === Gdk.BUTTON_PRIMARY) || buttonClicked === Gdk.BUTTON_SECONDARY) {
						win!.visible = false;
					}
				}}
			>
				<Fixed
					className="popup-container"
					canFocus
					setup={(self) => {
						self.put(
							<eventbox
								onButtonPressEvent={(_, event) => {
									const buttonClicked = event.get_button()[1];

									if (buttonClicked === Gdk.BUTTON_PRIMARY || buttonClicked === Gdk.BUTTON_SECONDARY) {
										return true;
									}
								}}
							>
								{/* <revealer
									revealChild={false}
									setup={(self: Revealer) => {
										App.connect("window-toggled", (app) => {
											const win = app.get_window(name);
											const vis = win?.get_visible();

											if (win?.name === name) {
												self.set_reveal_child(vis ?? false);
											}
										});
									}}
									transitionType={transition}
									transitionDuration={400}
								> */}
								{child}
								{/* </revealer> */}
							</eventbox>,
							ScreenSizing({ type: "width", multiplier: xcoord ?? 0 }),
							ScreenSizing({ type: "height", multiplier: ycoord ?? 0 }),
						);
					}}
				/>
			</eventbox>
		</window>
	);
};
