import React from "react";
import UserEventItem from "./UserEventItem";
import "./UserEventsSummary.css";

const UserEventsSummary = ({
  eventsByUser, // Artık { userId1: { displayName: 'Ahmet', events: [...] }, userId2: ... } formatında
  userColorMap, // profile.id (UUID) -> renk haritası
  darkenColorFn, // App.js'den gelenler
  getContrastColorFn, // App.js'den gelenler
  currentUser,
  profiles, // App.js'den gelen tüm profiller listesi
  onDeleteEvent,
  onToggleEventDone,
  onOpenEditModal,
}) => {
  // eventsByUser objesinin boş olup olmadığını kontrol et
  const hasUserGroups = Object.keys(eventsByUser).length > 0;
  const hasAnyEvents =
    hasUserGroups &&
    Object.values(eventsByUser).some(group => group.events.length > 0);

  if (!hasAnyEvents) {
    return (
      <div className="user-events-summary-container">
        <p className="no-events-global-message">
          Gösterilecek planlanmış etkinlik bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="user-events-summary-container">
      <h2>Kullanıcı Etkinlikleri Özeti</h2>
      {Object.entries(eventsByUser).map(([userId, userGroupData]) => {
        // userId burada profile.id (UUID) olacak
        // userGroupData ise { displayName: 'Ahmet', events: [...] } şeklinde

        const userBackgroundColor = userColorMap.get(userId) || "#E0E0E0"; // userColorMap userId (UUID) ile çalışmalı
        const userBorderColor = darkenColorFn(userBackgroundColor, 15);
        const userHeaderTextColor = getContrastColorFn(userBackgroundColor);

        // Sadece etkinliği olan kullanıcıları göster veya her kullanıcı için bir bölüm göster
        // if (userGroupData.events.length === 0) {
        //   return null; // Veya "bu kullanıcı için etkinlik yok" mesajı göster
        // }

        return (
          <div
            key={userId}
            className="user-group"
            style={{
              backgroundColor: userBackgroundColor,
              borderColor: userBorderColor,
            }}
          >
            <h3 style={{ color: userHeaderTextColor }}>
              {userGroupData.displayName}
            </h3>
            {userGroupData.events.length > 0 ? (
              <ul>
                {userGroupData.events.map(event => (
                  <UserEventItem
                    key={event.id}
                    event={event} // event.user_id (UUID) içeriyor
                    // eventUser prop'una gerek kalmadı, canModify kontrolü currentUser.id ve event.user_id ile yapılacak
                    currentUser={currentUser}
                    onDeleteEvent={onDeleteEvent}
                    onToggleEventDone={onToggleEventDone}
                    onOpenEditModal={onOpenEditModal}
                  />
                ))}
              </ul>
            ) : (
              <p
                className="no-events-for-user-ingroup"
                style={{ color: userHeaderTextColor }}
              >
                Bu kullanıcı için planlanmış etkinlik yok.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserEventsSummary;
