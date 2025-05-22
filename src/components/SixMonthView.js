import React from "react";
import MonthCalendar from "./MonthCalendar";
import "./SixMonthView.css";

const SixMonthView = ({
  startDisplayDate,
  onDayClick,
  events,
  addMonthsUtil,
  userColorMap,
  darkenColorFn,
  getContrastColorFn,
  profiles, // profiles prop'unu al
}) => {
  const monthsToDisplay = [];
  for (let i = 0; i < 6; i++) {
    monthsToDisplay.push(addMonthsUtil(startDisplayDate, i));
  }

  return (
    <div className="six-month-view-container">
      {monthsToDisplay.map((monthDate, index) => (
        <div key={index} className="single-month-container">
          <MonthCalendar
            displayMonth={monthDate}
            onDayClick={onDayClick}
            events={events}
            userColorMap={userColorMap}
            darkenColorFn={darkenColorFn}
            getContrastColorFn={getContrastColorFn}
            profiles={profiles} // MonthCalendar'a aktar
          />
        </div>
      ))}
    </div>
  );
};

export default SixMonthView;
