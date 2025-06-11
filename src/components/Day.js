import React from "react";
import Event from "./Event";
// Day.css'e gerek yok, stiller App.css içinde

const Day = ({
  date, // Bu Date objesi, o günün tarihi
  events, // Bu güne ait etkinlikler (start_at içeriyor)
  onClick, // (date: Date) => void
  userColorMap,
  darkenColorFn,
  getContrastColorFn,
  profiles,
  today,
}) => {
  // Gün içindeki etkinlikleri saatine göre sırala
  const sortedDayEvents = [...events].sort((a, b) => {
    if (!a.start_at || !b.start_at) return 0; // Eğer start_at yoksa sıralamayı etkileme
    return new Date(a.start_at) - new Date(b.start_at);
  });
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  // Dinamik olarak sınıf ekle
  const dayClasses = `calendar-day ${isToday ? "today" : ""}`;

  return (
    <div className={dayClasses} onClick={() => onClick(date)}>
      <span className="day-number">{date.getDate()}</span>
      <div className="events-container">
        {sortedDayEvents.map(event => (
          <Event
            key={event.id}
            event={event} // event objesi (start_at, user_id vb. içerir)
            userColorMap={userColorMap}
            darkenColorFn={darkenColorFn}
            getContrastColorFn={getContrastColorFn}
            profiles={profiles} // Event'e aktar
          />
        ))}
      </div>
    </div>
  );
};

export default Day;
