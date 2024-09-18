import { execAsync, Widget, Gdk, Gtk, App } from "astal"
import Hyprland from "gi://AstalHyprland"
const hyprland = Hyprland.get_default()
import { Icons } from "../lib/icons"

const { Box, Icon, Button, Revealer } = Widget;

export const TerminalIcon = () => Button({
	className: 'quickaccessicon',
	tooltip_text: 'Terminal',
	child: Icon({
		icon: 'terminator'
	}),
	onClicked: () => {
		Hyprland.messageAsync(`dispatch exec konsole`);
		App.closeWindow('dashboard');
	},
})

export const KontactIcon = () => Button({
	className: 'quickaccessicon',
	tooltip_text: 'eMail',
	child: Icon({
		icon: 'kube-mail'
	}),
	onClicked: () => {
		Hyprland.messageAsync(`dispatch exec kontact`);
		App.closeWindow('dashboard');
	},
})

export const VPNIcon = item => Button({
	className: 'quickaccessicon',
	tooltip_text: 'WireGuard VPN',
	child: Icon({
		icon: 'preferences-system-network-vpn'
	}),
	onClicked: () => {
		Hyprland.messageAsync(`dispatch exec wireguird`);
		App.closeWindow('dashboard');
	},
})

export const Enpass = () => Button({
	className: 'quickaccessicon',
	tooltip_text: 'Enpass',
	child: Icon({
		icon: 'enpass'
	}),
	onClicked: () => {
		Hyprland.messageAsync(`dispatch exec enpass`);
		App.closeWindow('dashboard');
	},
})
