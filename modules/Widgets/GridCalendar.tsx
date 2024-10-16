import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
// import { Icons } from "../lib/icons"
const { Label } = Widget;


const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const generateCalendar = (month, year) => {
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
  let gridCalendar;
  let dayLabels = [];

  const updateGridCalendar = () => {
    const updatedWeeks = generateCalendar(currentMonth, currentYear);

    if (!gridCalendar) {
      gridCalendar = new Gtk.Grid({
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
      });
    }

    dayLabels.forEach(label => gridCalendar.remove(label));
    dayLabels = [];

    daysOfWeek.forEach((day, index) => {
      const dayLabel = new Label({ label: day });
      dayLabel.get_style_context().add_class("calendar-days");
      gridCalendar.attach(dayLabel, index, 0, 1, 1);
      dayLabels.push(dayLabel);
    });

    updatedWeeks.forEach((week, rowIndex) => {
      week.forEach((day, columnIndex) => {
        const dayLabel = new Label({ label: day.toString() || '' });
        dayLabel.get_style_context().add_class('calendar-day');

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Identify whether the day is from the previous, current, or next month
        const isPrevMonthDay = rowIndex === 0 && columnIndex < firstDayOfMonth;
        const isNextMonthDay = rowIndex > 0 && day <= 7 && (rowIndex === updatedWeeks.length - 1 || columnIndex >= daysInMonth);

        const isCurrentMonthDay = !isPrevMonthDay && !isNextMonthDay;

        if (isCurrentMonthDay &&
          day === new Date().getDate() &&
          currentMonth === new Date().getMonth() &&
          currentYear === new Date().getFullYear()) {
          dayLabel.set_markup(`<b>${day}</b>`);
          dayLabel.get_style_context().add_class("calendar-today");
        }

        gridCalendar.attach(dayLabel, columnIndex, rowIndex + 1, 1, 1);
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

  const monthLabel = new Label({ label: monthNamesShort[currentMonth] });
  monthLabel.get_style_context().add_class("calendar-month-label");

  const yearLabel = new Label({ label: currentYear.toString() });
  yearLabel.get_style_context().add_class("calendar-year-label");

  const header = (
    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
      <button halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className={"calendar month arrow-left"} onClick={() => changeMonth(-1)}>
        <icon icon={"arrow-back-circle-symbolic"} />
      </button>
      {monthLabel}
      <button halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className={"calendar month arrow-right"} onClick={() => changeMonth(1)}>
        <icon icon={"arrow-forward-circle-symbolic"} />
      </button>
      <button halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className={"calendar return-today"} onClick={() => {

        currentMonth = new Date().getMonth();
        currentYear = new Date().getFullYear();
        monthLabel.set_text(monthNamesShort[currentMonth]);
        yearLabel.set_text(currentYear.toString());
        updateGridCalendar();
      }}>
        <icon icon={"nix-snowflake-symbolic"} />
      </button>
      <button halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className={"calendar year arrow-left"} onClick={() => changeYear(-1)}>
        <icon icon={"arrow-back-circle-symbolic"} />
      </button>
      {yearLabel}
      <button halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className={"calendar year arrow-right"} onClick={() => changeYear(1)}>
        <icon icon={"arrow-forward-circle-symbolic"} />
      </button>

    </box>
  );

  updateGridCalendar();

  return (
    <box name={"calendar"} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
      {header}
      {gridCalendar}
    </box>
  )
}

export default GridCalendar;