import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { execAsync, bind, Variable } from "astal";
import Icon from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";
import Pango from "gi://Pango";
import NM from "gi://NM";
import Spinner from "../../Astalified/Spinner";

const network = AstalNetwork.get_default();
const Wifi = network.wifi;

function Header() {
	function spinSetup(spinner: Spinner) {
		bind(Wifi, "scanning").as((s) => (s ? spinner.start : spinner.stop));
	}

	const theSpinner = new Spinner({
		name: "refreshspinner",
		setup: spinSetup,
		halign: Gtk.Align.CENTER,
		valign: Gtk.Align.CENTER,
	});

	const refresh = (
		<stack visible={true} halign={Gtk.Align.END} visible_child_name={bind(Wifi, "scanning").as((s) => (s ? "refreshspinner" : "refreshbtn"))} homogeneous={false}>
			{theSpinner}
			<button
				name={"refreshbtn"}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						Wifi.scan();
					}
				}}
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
				tooltip_text={bind(Wifi, "scanning").as((v) => (v ? "wifi scanning" : ""))}
			>
				<icon icon={"view-refresh-symbolic"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
			</button>
		</stack>
	);
	const enable = (
		<button
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					execAsync(`nmcli radio wifi ${Wifi.enabled ? "off" : "on"}`);
				}
			}}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			tooltip_text={bind(Wifi, "enabled").as((v) => (v ? "Disable" : "Enable"))}
		>
			<icon icon={bind(Wifi, "enabled").as((v) => (v ? Icon.network.wifi.enabled : Icon.network.wifi.disabled))} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
		</button>
	);
	const head = <label label={"Wi-Fi"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />;

	return (
		<centerbox
			className={"wifi header"}
			halign={Gtk.Align.FILL}
			valign={Gtk.Align.FILL}
			vertical={false}
			centerWidget={head}
			endWidget={
				<box halign={Gtk.Align.CENTER} vertical={false} spacing={15}>
					{enable}
					{refresh}
				</box>
			}
		/>
	);
}

function WifiAP(ap) {
	const isActiveAP = Wifi.active_access_point && Wifi.active_access_point.ssid === ap.ssid ? true : false;
	const isConnecting = NM.State.CONNECTING === ap.state ? true : false;
	const passreveal = Variable(false);
	const noPw = NM["80211ApSecurityFlags"].NONE;
	const apPrivacy = NM["80211ApFlags"].NONE;
	const SecuredAP = !apPrivacy && !noPw;

	const checkStoredPassword = async (ssid: string): Promise<boolean> => {
		try {
			const result = await execAsync(`nmcli -s -g 802-11-wireless-security.psk connection show "${ap.ssid}"`);
			return result.trim() !== "";
		} catch (error) {
			return false;
		}
	};

	const PasswordEntry = (
		<entry
			placeholder_text={"Enter Password"}
			visibility={false}
			visible={true}
			halign={Gtk.Align.FILL}
			valign={Gtk.Align.FILL}
			css={`
				min-width: 10px;
				min-height: 10px;
			`}
			onActivate={(self) => {
				const password = self.get_text();
				if (password) {
					execAsync(`nmcli dev wifi connect ${ap.ssid} password ${password}`).then(
						() => {
							execAsync(`notify-send "WiFi" "Successfully connected to Secured ${ap.ssid}"`);
						},
						(error) => {
							execAsync(`notify-send -u critical "WiFi Error" "Failed to connect to ${ap.ssid}"`);
						},
					);
				}
			}}
		/>
	);

	const PasswordReveal = (
		<revealer halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN} transitionDuration={300} revealChild={bind(passreveal)} visible={bind(passreveal)}>
			{PasswordEntry}
		</revealer>
	);

	const APEntry = () => {
		const IconLabel = (
			<box vertical={false} spacing={5} halign={Gtk.Align.START} valign={Gtk.Align.CENTER}>
				<icon icon={ap.icon_name} valign={Gtk.Align.CENTER} />
				<label label={ap.ssid} valign={Gtk.Align.CENTER} ellipsize={Pango.EllipsizeMode.MIDDLE} tooltip_text={isActiveAP ? "" : SecuredAP ? "Secured: Password Required" : "Unsecured"} />
				<label label={(ap.frequency / 1000).toFixed(1) + "GHz"} valign={Gtk.Align.CENTER} />
				<label label={(ap.maxBitrate / 1000).toFixed(0) + "Mbps"} valign={Gtk.Align.CENTER} />
			</box>
		);

		return (
			<button
				halign={Gtk.Align.FILL}
				valign={Gtk.Align.CENTER}
				cursor={"pointer"}
				onClick={async (_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						if (SecuredAP) {
							const hasStoredPassword = await checkStoredPassword(ap.ssid);
							if (hasStoredPassword) {
								execAsync(`nmcli con up "${ap.ssid}"`).then(
									() => execAsync(`notify-send "WiFi" "Connected to ${ap.ssid}"`),
									(error) => execAsync(`notify-send -u critical "WiFi Error" "Failed to connect to ${ap.ssid}"`),
								);
							} else {
								passreveal.set(true);
								PasswordEntry.grab_focus();
							}
						} else {
							execAsync(`nmcli con up ${ap.ssid}`);
						}
					}
				}}
			>
				{IconLabel}
			</button>
		);
	};

	const APDisconnect = (
		<button
			className={"wifi ap disconnect"}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					execAsync(`nmcli con down ${ap.ssid}`).then(
						() => {
							execAsync(`notify-send "WiFi" "Disconnected from ${ap.ssid}"`);
						},
						(error) => {
							execAsync(`notify-send -u critical "WiFi Error" "Failed to Disconnect ${ap.ssid}: ${error}"`);
							console.error(`Failed to Disconnect ${ap.ssid}: ${error}`);
						},
					);
				}
			}}
			halign={Gtk.Align.END}
			valign={Gtk.Align.CENTER}
			tooltip_text={"Disconnect"}
			cursor={"pointer"}
			visible={isActiveAP}
		>
			<icon icon={"circle-x-symbolic"} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
		</button>
	);

	const APForget = (
		<button
			className={"wifi ap forget"}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					execAsync(`nmcli connection delete ${ap.ssid}`).then(
						() => {
							execAsync(`notify-send "WiFi" "Forgot ${ap.ssid}"`);
						},
						(error) => {
							execAsync(`notify-send -u critical "WiFi Error" "Failed to forget ${ap.ssid}"`);
							console.error(`Failed to forget ${ap.ssid}: ${error}`);
						},
					);
				}
			}}
			halign={Gtk.Align.END}
			valign={Gtk.Align.CENTER}
			tooltip_text={"Forget/Delete SSID"}
			cursor={"pointer"}
			visible={isActiveAP}
		>
			<icon icon={"edit-delete-symbolic"} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
		</button>
	);
	function spinSetup(spinner: Spinner) {
		isConnecting ? spinner.start() : spinner.stop();
	}
	const theSpinner = new Spinner({
		name: "connectionSpinner",
		setup: spinSetup,
		halign: Gtk.Align.CENTER,
		valign: Gtk.Align.CENTER,
	});
	const APItem = (
		<box vertical={true}>
			<centerbox
				className={`wifi ap ${isActiveAP ? "connected" : ""}`}
				vertical={false}
				halign={Gtk.Align.FILL}
				valign={Gtk.Align.FILL}
				startWidget={APEntry()}
				endWidget={
					<stack
						className={"wifi connected controls"}
						visible={isActiveAP || isConnecting}
						halign={Gtk.Align.END}
						visible_child_name={isConnecting ? "connectionSpinner" : "controls"}
						homogeneous={false}
					>
						<box name={"connectionSpinner"} halign={Gtk.Align.END}>
							{theSpinner}
							<label label={"Connecting..."} halign={Gtk.Align.END} valign={Gtk.Align.CENTER} />
						</box>
						<box name={"controls"} halign={Gtk.Align.END} spacing={5}>
							{APDisconnect}
							{APForget}
						</box>
					</stack>
				}
			/>
			{PasswordReveal}
		</box>
	);

	return (
		<box vertical={true} spacing={10}>
			{APItem}
		</box>
	);
}

function WifiAPs() {
	const APList = bind(Wifi, "accessPoints").as((aps) => {
		const activeAP = Wifi.active_access_point || null;

		const groupedAPs = aps.reduce((acc, ap) => {
			const ssid = ap.ssid ? ap.ssid.trim() : null;
			if (!ssid) return acc;

			if (!acc[ssid]) {
				acc[ssid] = [];
			}
			acc[ssid].push(ap);

			return acc;
		}, {});

		const sortedAPGroups = Object.values(groupedAPs).map((apGroup) => {
			apGroup.sort((a, b) => {
				if (a === activeAP) return -1;
				if (b === activeAP) return 1;

				return b.strength - a.strength;
			});

			return apGroup[0];
		});

		sortedAPGroups.sort((a, b) => {
			if (a === activeAP) return -1;
			if (b === activeAP) return 1;

			return b.strength - a.strength;
		});

		return sortedAPGroups.map((ap) => WifiAP(ap));
	});

	return (
		<box className={"network wifi container"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={true} visible={true} vertical={true} spacing={10}>
			<Header />
			<scrollable halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} visible={true} vscroll={Gtk.PolicyType.AUTOMATIC} hscroll={Gtk.PolicyType.NEVER} vexpand={true}>
				<box className={"wifi aplist-inner"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} visible={true} vertical={true} spacing={5}>
					{APList}
				</box>
			</scrollable>
		</box>
	);
}

export default WifiAPs;
