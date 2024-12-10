import { Gdk, App, Widget } from "astal/gtk3";
import { winwidth, winheight } from "./screensizeadjust";

export default function ({ id, width, height, windowName, ...props }: { id: number, width: number, height: number, windowName: string } & Widget.EventBoxProps) {
	return (
		<eventbox
			onClick={(_, event) => {
				const win = App.get_window(windowName);
				if (event.button === Gdk.BUTTON_PRIMARY && win?.visible) {
					win.visible = false;
				}
			}}
			widthRequest={winwidth(width)}
			heightRequest={winheight(height)}
			{...props}
		/>
	);
}
