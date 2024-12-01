import { Gtk, Gdk, App, Widget } from "astal/gtk3";
import { Grid } from "../Astalified/index";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const generateCalendar = (month: number, year: number) => {
	const firstDayOfMonth = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const weeks = [];

	let week = [];
	let prevMonthLastDay = new Date(year, month, 0).getDate();
	let prevMonthDays = firstDayOfMonth;
	for (let i = prevMonthLastDay - prevMonthDays + 1; i <= prevMonthLastDay; i++) {
		week.push(i);
	}

	for (let i = 1; i <= daysInMonth; i++) {
		week.push(i);
		if (week.length === 7) {
			weeks.push(week);
			week = [];
		}
	}

	if (week.length > 0) {
		const remainingDays = 7 - week.length;
		for (let i = 1; i <= remainingDays; i++) {
			week.push(i);
		}
		weeks.push(week);
	}

	return weeks;
};

function GridCalendar() {
	let currentMonth = new Date().getMonth();
	let currentYear = new Date().getFullYear();
	let gridCalendar: JSX.Element | null = null;
	let dayLabels: JSX.Element[] = [];

	const updateGridCalendar = () => {
		const updatedWeeks = generateCalendar(currentMonth, currentYear);

		if (!gridCalendar) {
			gridCalendar = <Grid halign={CENTER} valign={CENTER} columnSpacing={1} rowSpacing={1} rowHomogeneous={true} columnHomogeneous={true} />;
		}

		dayLabels.forEach((label) => gridCalendar!.remove(label));
		dayLabels = [];

		daysOfWeek.forEach((day, index) => {
			const dayLabel = <label label={day} />;
			dayLabel.get_style_context().add_class("calendar-days");
			gridCalendar!.attach(dayLabel, index, 0, 1, 1);
			dayLabels.push(dayLabel);
		});

		updatedWeeks.forEach((week, rowIndex) => {
			week.forEach((day, columnIndex) => {
				const dayLabel = <label label={day.toString()} />;
				dayLabel.get_style_context().add_class("calendar-day");

				const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
				const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

				// Identify whether the day is from the previous, current, or next month
				const isPrevMonthDay = rowIndex === 0 && columnIndex < firstDayOfMonth;
				const isNextMonthDay = rowIndex > 0 && day <= 7 && (rowIndex === updatedWeeks.length - 1 || columnIndex >= daysInMonth);

				const isCurrentMonthDay = !isPrevMonthDay && !isNextMonthDay;

				if (isCurrentMonthDay && day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()) {
					dayLabel.set_markup(`<b>${day}</b>`);
					dayLabel.get_style_context().add_class("calendar-today");
				}

				gridCalendar!.attach(dayLabel, columnIndex, rowIndex + 1, 1, 1);
				dayLabels.push(dayLabel);
			});
		});

		gridCalendar.show_all();
	};

	const changeMonth = (offset) => {
		currentMonth += offset;
		if (currentMonth < 0) {
			currentMonth = 11;
			currentYear -= 1;
		} else if (currentMonth > 11) {
			currentMonth = 0;
			currentYear += 1;
		}
		monthLabel.set_text(monthNamesShort[currentMonth]);
		yearLabel.set_text(currentYear.toString());
		updateGridCalendar();
	};

	const changeYear = (offset) => {
		currentYear += offset;
		yearLabel.set_text(currentYear.toString());
		updateGridCalendar();
	};

	const monthLabel = <label label={monthNamesShort[currentMonth]} />;
	monthLabel.get_style_context().add_class("month");

	const yearLabel = <label label={currentYear.toString()} />;
	yearLabel.get_style_context().add_class("year");

	function header() {
		const prevMonth = (
			<button halign={CENTER} valign={CENTER} className={"arrow-left"} onClick={() => changeMonth(-1)}>
				<icon icon={"arrow-back-circle-symbolic"} />
			</button>
		);

		const nextMonth = (
			<button halign={CENTER} valign={CENTER} className={"arrow-right"} onClick={() => changeMonth(1)}>
				<icon icon={"arrow-forward-circle-symbolic"} />
			</button>
		);

		const returnToday = (
			<button
				halign={CENTER}
				valign={CENTER}
				className={"return-today"}
				onClick={() => {
					currentMonth = new Date().getMonth();
					currentYear = new Date().getFullYear();
					monthLabel.set_text(monthNamesShort[currentMonth]);
					yearLabel.set_text(currentYear.toString());
					updateGridCalendar();
				}}
			>
				<icon icon={"nix-snowflake-symbolic"} />
			</button>
		);

		const prevYear = (
			<button halign={CENTER} valign={CENTER} className={"arrow-left"} onClick={() => changeYear(-1)}>
				<icon icon={"arrow-back-circle-symbolic"} />
			</button>
		);

		const nextYear = (
			<button halign={CENTER} valign={CENTER} className={"arrow-right"} onClick={() => changeYear(1)}>
				<icon icon={"arrow-forward-circle-symbolic"} />
			</button>
		);

		const headerGrid = <Grid className={"calendar header"} columnSpacing={10} halign={CENTER} valign={CENTER} hexpand={true} vexpand={false} columnHomogeneous={false}
			setup={(self) => {
				self.attach(prevMonth, 0, 0, 1, 1);
				self.attach(monthLabel, 1, 0, 1, 1);
				self.attach(nextMonth, 2, 0, 1, 1);
				self.attach(returnToday, 3, 0, 1, 1);
				self.attach(prevYear, 4, 0, 1, 1);
				self.attach(yearLabel, 5, 0, 1, 1);
				self.attach(nextYear, 6, 0, 1, 1);
			}}
		/>;

		return headerGrid;
	}

	updateGridCalendar();

	return (
		<box name={"calendar"} orientation={Gtk.Orientation.VERTICAL} halign={CENTER} valign={CENTER}>
			{header()}
			{gridCalendar}
		</box>
	);
}

export default GridCalendar;
