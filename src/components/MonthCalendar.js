import React from "react";
import Day from "./Day";

const generateCalendarDays = (
  displayMonth, // Görüntülenen ayın herhangi bir günü (genellikle ilk günü)
  events, // Tüm etkinlikler (start_at UTC ISO string içerir)
  onDayClick,
  userColorMap,
  darkenColorFn,
  getContrastColorFn,
  profiles,
  today
) => {
  const days = [];
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Pazartesi = 0 ... Pazar = 6

  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(
      <div
        key={`prev-empty-${month}-${i}`}
        className="calendar-day empty"
      ></div>
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const calendarCellDate = new Date(year, month, day); // Bu, o takvim hücresinin yerel tarihini temsil eder (saat 00:00)

    const dayEvents = events.filter(event => {
      if (!event.start_at) return false;
      // Etkinliğin UTC start_at'ini yerel Date objesine çevir
      const eventLocalDate = new Date(event.start_at);

      // Yerel tarih kısımlarını karşılaştır
      return (
        eventLocalDate.getFullYear() === calendarCellDate.getFullYear() &&
        eventLocalDate.getMonth() === calendarCellDate.getMonth() &&
        eventLocalDate.getDate() === calendarCellDate.getDate()
      );
    });

    days.push(
      <Day
        key={`${month}-${day}`}
        date={calendarCellDate} // O günün Date objesini Day bileşenine gönder
        events={dayEvents}
        onClick={onDayClick}
        userColorMap={userColorMap}
        darkenColorFn={darkenColorFn}
        getContrastColorFn={getContrastColorFn}
        profiles={profiles}
        today={today}
      />
    );
  }
  return days;
};

const MonthCalendar = ({
  displayMonth,
  onDayClick,
  events,
  userColorMap,
  darkenColorFn,
  getContrastColorFn,
  profiles,
  today,
}) => {
  const days = generateCalendarDays(
    displayMonth,
    events,
    onDayClick,
    userColorMap,
    darkenColorFn,
    getContrastColorFn,
    profiles,
    today
  );
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div className="month-calendar">
      <div className="month-header">
        <h3>
          {displayMonth.toLocaleString("tr-TR", {
            month: "long",
            year: "numeric",
          })}
        </h3>
      </div>
      <div className="days-header">
        {dayNames.map(dayName => (
          <div key={dayName} className="calendar-day-name">
            {dayName}
          </div>
        ))}
      </div>
      <div className="calendar-grid">{days}</div>
    </div>
  );
};

export default MonthCalendar;
