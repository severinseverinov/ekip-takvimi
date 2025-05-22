import React from "react";
// App.css içinde .event ve .event-done stilleri var

const Event = ({
  event,
  userColorMap,
  darkenColorFn,
  getContrastColorFn,
  profiles,
}) => {
  // Kullanıcı rengini bulma
  // userColorMap artık profile.id (UUID) -> renk şeklinde
  const userBackgroundColor = userColorMap.get(event.user_id) || "#E0E0E0"; // user_id ile direkt eşleşme
  const userTextColor = getContrastColorFn(userBackgroundColor);
  const userBorderColor = darkenColorFn(userBackgroundColor, 20);

  const eventClasses = `event ${event.isDone ? "event-done" : ""}`;

  let displayTitle = event.title;
  if (event.start_at) {
    const timePart = new Date(event.start_at).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    displayTitle = `${timePart} ${event.title}`;
  }

  return (
    <div
      className={eventClasses}
      style={{
        backgroundColor: userBackgroundColor,
        borderLeftColor: userBorderColor,
        color: userTextColor,
      }}
      title={event.isDone ? `${displayTitle} (Yapıldı)` : displayTitle}
    >
      <strong>{displayTitle}</strong>
    </div>
  );
};

export default Event;
