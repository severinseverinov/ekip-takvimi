import React from "react";
import Day from "./Day";
// MonthCalendar.css'e gerek yok, stiller App.css içinde

const generateCalendarDays = (
  displayMonth,
  events,
  onDayClick,
  userColorMap,
  darkenColorFn,
  getContrastColorFn,
  profiles // profiles prop'unu al
) => {
  const days = [];
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth(); // 0-indexed
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0); // Ayın son günü
  const daysInMonth = lastDayOfMonth.getDate();

  // Haftanın ilk günü Pazartesi olacak şekilde ayarla (getDay() Pazar=0 verir)
  let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Ayın ilk gününden önceki boş günler
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(
      <div
        key={`prev-empty-${month}-${i}`}
        className="calendar-day empty"
      ></div>
    );
  }

  // Ayın günleri
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    // Etkinlikleri filtrelerken sadece tarih kısmını karşılaştır
    // start_at timestamp olduğu için günün başlangıcı ve bitişi arasında kontrol etmek daha doğru olur
    // ama basitlik için şimdilik string karşılaştırması (UTC'ye dikkat!)
    const currentDateStr = date.toISOString().split("T")[0];
    const dayEvents = events.filter(event => {
      if (!event.start_at) return false;
      return event.start_at.startsWith(currentDateStr);
    });

    days.push(
      <Day
        key={`${month}-${day}`}
        date={date} // Günün tam Date objesi
        events={dayEvents}
        onClick={onDayClick} // onDayClick doğrudan date objesini almalı
        userColorMap={userColorMap}
        darkenColorFn={darkenColorFn}
        getContrastColorFn={getContrastColorFn}
        profiles={profiles} // Day'e aktar
      />
    );
  }

  // Ayın son gününden sonraki boş günler (takvim gridini 6 satıra tamamlamak için)
  // Toplam hücre sayısı genellikle 7 (sütun) * 6 (satır) = 42
  // Veya mevcut gün sayısı + boşluklar üzerinden hesapla
  const totalCells = startDayOfWeek + daysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7; // Bir sonraki haftanın başlangıcına kadar olan boşluklar
  // Veya daha basitçe, gridi 6 satıra (42 hücre) tamamla:
  // const remainingCells = 42 - (startDayOfWeek + daysInMonth);
  // for (let i = 0; i < remainingCells; i++) {
  //   days.push(<div key={`next-empty-${month}-${i}`} className="calendar-day empty"></div>);
  // }

  return days;
};

const MonthCalendar = ({
  displayMonth,
  onDayClick,
  events,
  userColorMap,
  darkenColorFn,
  getContrastColorFn,
  profiles, // profiles prop'unu al
}) => {
  const days = generateCalendarDays(
    displayMonth,
    events,
    onDayClick, // onDayClick doğrudan date objesini almalı
    userColorMap,
    darkenColorFn,
    getContrastColorFn,
    profiles // generateCalendarDays'e aktar
  );
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]; // Türkçe gün isimleri

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
