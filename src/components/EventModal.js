import React, { useState, useEffect } from "react";
// App.css içindeki modal stilleri kullanılacak

const EventModal = ({
  dateForNewEvent,
  eventToEdit,
  onClose,
  onAddEventSubmit, // (title, startAtTimestamp) => void
  onEditEventSubmit, // (eventId, newTitle, startAtTimestamp) => void
}) => {
  const isEditMode = !!eventToEdit;
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("10:00"); // Varsayılan saat

  useEffect(() => {
    if (isEditMode && eventToEdit) {
      setTitle(eventToEdit.title);
      if (eventToEdit.start_at) {
        const eventDateObj = new Date(eventToEdit.start_at);
        // Tarayıcının yerel saat dilimine göre saati alıp input'a set et
        const localHours = eventDateObj.getHours().toString().padStart(2, "0");
        const localMinutes = eventDateObj
          .getMinutes()
          .toString()
          .padStart(2, "0");
        setTime(`${localHours}:${localMinutes}`);
      } else {
        setTime("10:00");
      }
    } else {
      setTitle("");
      setTime("10:00");
    }
  }, [isEditMode, eventToEdit]);

  const handleSubmit = e => {
    e.preventDefault();
    if (title.trim() && time) {
      let finalTimestampISO;
      const [hours, minutes] = time.split(":").map(Number);

      if (isEditMode && eventToEdit) {
        const existingEventDate = new Date(eventToEdit.start_at); // Bu zaten UTC veya yerel olabilir
        // Kullanıcının girdiği saati, etkinliğin orijinal gününe uygula
        // new Date() tarayıcının yerel saat dilimini kullanır.
        // Tarih kısmını eventToEdit'ten al, saat kısmını input'tan
        const year = existingEventDate.getFullYear();
        const month = existingEventDate.getMonth(); // 0-11
        const day = existingEventDate.getDate();
        finalTimestampISO = new Date(
          year,
          month,
          day,
          hours,
          minutes
        ).toISOString();
        onEditEventSubmit(eventToEdit.id, title.trim(), finalTimestampISO);
      } else if (dateForNewEvent) {
        const year = dateForNewEvent.getFullYear();
        const month = dateForNewEvent.getMonth();
        const day = dateForNewEvent.getDate();
        finalTimestampISO = new Date(
          year,
          month,
          day,
          hours,
          minutes
        ).toISOString();
        onAddEventSubmit(title.trim(), finalTimestampISO);
      }
    } else {
      alert("Etkinlik başlığı ve saat boş olamaz!");
    }
  };

  const displayDateForTitle =
    isEditMode && eventToEdit
      ? new Date(eventToEdit.start_at).toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : dateForNewEvent
      ? dateForNewEvent.toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  const modalTitleText = isEditMode
    ? `Etkinliği Düzenle (${displayDateForTitle})`
    : `Etkinlik Ekle - ${displayDateForTitle}`;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{modalTitleText}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="event-title-modal">Başlık:</label>
            <input
              id="event-title-modal"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Etkinlik başlığı"
              required
              autoFocus
              className="event-title-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="event-time-modal">Saat:</label>
            <input
              id="event-time-modal"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
              className="event-time-input"
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="modal-submit-btn">
              {isEditMode ? "Kaydet" : "Ekle"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="modal-cancel-btn"
            >
              Kapat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
