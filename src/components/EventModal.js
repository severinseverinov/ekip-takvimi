import React, { useState, useEffect } from "react";

const EventModal = ({
  dateForNewEvent,
  eventToEdit,
  onClose,
  onAddEventSubmit,
  onEditEventSubmit,
}) => {
  const isEditMode = !!eventToEdit;
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("10:00"); // Varsayılan saat

  useEffect(() => {
    if (isEditMode && eventToEdit) {
      setTitle(eventToEdit.title);
      if (eventToEdit.start_at) {
        const eventDateObj = new Date(eventToEdit.start_at); // UTC string'den yerel Date objesi
        // Input'a göstermek için yerel saati al
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
      const [hours, minutes] = time.split(":").map(Number);
      let finalTimestampISO;

      if (isEditMode && eventToEdit) {
        // Düzenleme: Mevcut etkinliğin orijinal tarihini (gün, ay, yıl) al,
        // yeni girilen yerel saati bu tarihe uygula.
        const originalEventFullDate = new Date(eventToEdit.start_at); // Bu UTC'yi yerel saate çevirir
        // Yeni Date objesi oluşturup, orijinal tarihin YIL, AY, GÜN'ünü alalım
        // ve yeni SAAT, DAKİKA'yı yerel olarak ayarlayalım.
        const year = originalEventFullDate.getFullYear();
        const month = originalEventFullDate.getMonth(); // 0-11 arası
        const day = originalEventFullDate.getDate();

        // Yeni tarih objesini yerel saat diliminde oluştur
        const updatedEventDateLocal = new Date(
          year,
          month,
          day,
          hours,
          minutes
        );
        finalTimestampISO = updatedEventDateLocal.toISOString(); // UTC'ye çevir
        onEditEventSubmit(eventToEdit.id, title.trim(), finalTimestampISO);
      } else if (dateForNewEvent) {
        // Ekleme: Takvimden seçilen gün (dateForNewEvent yerel 00:00'ı temsil eder)
        // ve yeni girilen yerel saati birleştir.
        const newEventFullDateLocal = new Date(dateForNewEvent); // Bu zaten yerel bir Date objesi
        newEventFullDateLocal.setHours(hours, minutes, 0, 0); // Yerel saati ayarla
        finalTimestampISO = newEventFullDateLocal.toISOString(); // UTC'ye çevir
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
