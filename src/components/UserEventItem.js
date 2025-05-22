import React, { useState, useEffect, useRef } from "react";
import "./UserEventItem.css";

const UserEventItem = ({
  event,
  // eventUser prop'u yerine event.user_id kullanılacak
  currentUser,
  onDeleteEvent,
  onToggleEventDone,
  onOpenEditModal,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // currentUser null değilse ve id'si varsa kontrol et
  const canModify = currentUser && currentUser.id === event.user_id;

  const dropdownRef = useRef(null);
  const optionsButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        optionsButtonRef.current &&
        !optionsButtonRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDelete = () => {
    onDeleteEvent(event.id);
  };

  const handleToggleDone = () => {
    onToggleEventDone(event.id);
  };

  const handleEdit = () => {
    onOpenEditModal(event);
  };

  const toggleDropdown = e => {
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  };

  const handleDropdownAction = actionCallback => {
    actionCallback();
    setIsDropdownOpen(false);
  };

  const itemStyle = {
    textDecoration: event.isDone ? "line-through" : "none",
    opacity: event.isDone ? 0.6 : 1,
  };

  const liClasses = `user-event-item ${
    isDropdownOpen ? "dropdown-host-active" : ""
  }`;

  let displayDateTime = "Tarih/Saat bilgisi yok";
  if (event.start_at) {
    const eventDateObj = new Date(event.start_at);
    const datePart = eventDateObj.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric", // Daha kısa format
    });
    const timePart = eventDateObj.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    displayDateTime = `${timePart} - ${datePart}`;
  }

  return (
    <li
      style={itemStyle}
      className={liClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="event-details">
        <span className="event-title">{event.title}</span>
        <span className="event-date-time">{displayDateTime}</span>
      </div>
      <div className="event-actions">
        {canModify && (isHovered || isDropdownOpen) && (
          <button
            ref={optionsButtonRef}
            onClick={toggleDropdown}
            className="action-btn options-btn"
            title="İşlemler"
          >
            &#x2026;
          </button>
        )}
        {isDropdownOpen && canModify && (
          <ul ref={dropdownRef} className="dropdown-menu">
            <li
              onClick={() => handleDropdownAction(handleToggleDone)}
              className="dropdown-item"
            >
              {event.isDone ? "Geri Al" : "Yapıldı"}
            </li>
            <li
              onClick={() => handleDropdownAction(handleEdit)}
              className="dropdown-item"
            >
              Düzenle
            </li>
            <li
              onClick={() => handleDropdownAction(handleDelete)}
              className="dropdown-item danger"
            >
              Sil
            </li>
          </ul>
        )}
      </div>
    </li>
  );
};

export default UserEventItem;
