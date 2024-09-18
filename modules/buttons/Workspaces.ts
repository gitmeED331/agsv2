import PanelButton from "../PanelButton"
import options from "../../../options"
import { sh, range } from "../../../lib/utils"
import { Hyprland, Widget } from "../../../imports"

const { Box } = Widget
const { workspaces } = options.bar.workspaces

const dispatch = (arg: string | number) => {
    sh(`hyprctl dispatch workspace ${arg}`)
}

const Workspaces = (ws: number) => Widget.Box({
	className: "workspaces",
    children: range(ws || 20).map(i => Widget.Label({
        attribute: i,
        vpack: "center",
        label: `${i}`,
        setup: self => self.hook(Hyprland, () => {
            self.toggleClassName("active", Hyprland.active.workspace.id === i)
            self.toggleClassName("occupied", (Hyprland.getWorkspace(i)?.windows || 0) > 0)
        }),
    })),
    setup: box => {
        if (ws === 0) {
            box.hook(Hyprland.active.workspace, () => box.children.map(btn => {
                btn.visible = Hyprland.workspaces.some(ws => ws.id === btn.attribute)
            }))
        }
    },
})

export default () => PanelButton({
    window: "overview",
    className: "workspaces",
    children: Array.from({ length: 4 }, (_, i) => i + 1).map((i) =>
    on_scroll_up: () => dispatch("m+1"),
    on_scroll_down: () => dispatch("m-1"),
    onMiddleClick: () => App.toggleWindow("overview"),
    child: workspaces.bind().as(Workspaces),
})
