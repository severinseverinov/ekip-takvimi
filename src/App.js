import React, { useState, useEffect, useMemo } from "react";
import SixMonthView from "./components/SixMonthView";
import EventModal from "./components/EventModal";
import UserEventsSummary from "./components/UserEventsSummary";
import { supabase } from "./supabaseClient";
import "./App.css";

// Renk paleti ve yardımcı fonksiyonlar
const USER_COLOR_PALETTE = [
  "#FFADAD",
  "#FFD6A5",
  "#FDFFB6",
  "#CAFFBF",
  "#9BF6FF",
  "#A0C4FF",
  "#BDB2FF",
  "#FFC6FF",
  "#E0BBE4",
  "#D3E0DC",
  "#FFACC7",
  "#FFC48C",
  "#FFF78A",
  "#B5FFD1",
  "#ADF3FF",
  "#AEC6FF",
  "#D7BFFF",
  "#FFC6FF",
  "#EAB9D7",
  "#C4D8D3",
];

function darkenColor(hex, percent) {
  if (!hex) return "#CCCCCC";
  hex = hex.replace(/^\s*#|\s*$/g, "");
  if (hex.length === 3) hex = hex.replace(/(.)/g, "$1$1");
  let r = parseInt(hex.substring(0, 2), 16),
    g = parseInt(hex.substring(2, 4), 16),
    b = parseInt(hex.substring(4, 6), 16);
  percent = Math.max(-100, Math.min(100, percent));
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? percent * -1 : percent;
  r = Math.max(0, Math.min(255, Math.round((t - r) * (p / 100)) + r));
  g = Math.max(0, Math.min(255, Math.round((t - g) * (p / 100)) + g));
  b = Math.max(0, Math.min(255, Math.round((t - b) * (p / 100)) + b));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

function getContrastColor(hexcolor) {
  if (!hexcolor) return "#000000";
  hexcolor = hexcolor.replace("#", "");
  if (hexcolor.length === 3) hexcolor = hexcolor.replace(/(.)/g, "$1$1");
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 135 ? "#2c3e50" : "#FFFFFF";
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

const groupAndSortEventsByUser = (events, profiles) => {
  const profileMap = new Map(profiles.map(p => [p.id, p]));

  const grouped = events.reduce((acc, event) => {
    const userProfile = profileMap.get(event.user_id);
    const userKey = userProfile?.id || event.user_id; // Gruplama anahtarı olarak her zaman ID kullan

    if (!acc[userKey]) {
      acc[userKey] = {
        displayName: userProfile?.username || event.user_id, // Görüntüleme için kullanıcı adı veya ID
        events: [],
      };
    }
    acc[userKey].events.push(event);
    return acc;
  }, {});

  for (const userIdKey in grouped) {
    grouped[userIdKey].events.sort(
      (a, b) => new Date(a.start_at) - new Date(b.start_at)
    );
  }
  return grouped;
};

function App() {
  const [startDisplayDate, setStartDisplayDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedDateForNewEvent, setSelectedDateForNewEvent] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ?? null);
        if (!session?.user) {
          // Kullanıcı çıkış yaptıysa veya session yoksa
          setEvents([]);
          setProfiles([]);
        }
        setLoading(false);
      }
    );
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (currentUser) {
        setLoading(true);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*");
        if (profilesError)
          console.error("Error fetching profiles:", profilesError);
        else setProfiles(profilesData || []);

        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .order("start_at", { ascending: true });

        if (eventsError) console.error("Error fetching events:", eventsError);
        else {
          setEvents(
            eventsData.map(event => ({
              ...event,
              isDone: event.is_done,
              start_at: event.start_at,
            })) || []
          );
        }
        setLoading(false);
      } else {
        setEvents([]);
        setProfiles([]);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [currentUser]);

  const userColorMap = useMemo(() => {
    const map = new Map();
    profiles.forEach((profile, index) => {
      map.set(
        profile.id,
        profile.color || USER_COLOR_PALETTE[index % USER_COLOR_PALETTE.length]
      );
    });
    return map;
  }, [profiles]);

  const eventsByUser = useMemo(
    () => groupAndSortEventsByUser(events, profiles),
    [events, profiles]
  );

  const handleDayClickForNewEvent = date => {
    if (!currentUser) {
      alert("Etkinlik eklemek için lütfen giriş yapın.");
      return;
    }
    setSelectedDateForNewEvent(date);
    setEventToEdit(null);
  };

  const handleOpenEditModal = event => {
    setEventToEdit(event);
    setSelectedDateForNewEvent(null);
  };

  const handleCloseModal = () => {
    setSelectedDateForNewEvent(null);
    setEventToEdit(null);
  };

  const handleAddEventSubmit = async (eventTitle, startAtTimestamp) => {
    if (!currentUser) return;
    if (eventTitle && startAtTimestamp) {
      const newEventData = {
        user_id: currentUser.id,
        title: eventTitle,
        start_at: startAtTimestamp,
        is_done: false,
      };
      const { data, error } = await supabase
        .from("events")
        .insert(newEventData)
        .select()
        .single(); // single() eklendi
      if (error) {
        console.error("Error adding event:", error.message);
        alert(`Etkinlik eklenirken hata oluştu: ${error.message}`);
      } else if (data) {
        const addedEventForState = {
          ...data,
          isDone: data.is_done,
          start_at: data.start_at,
        };
        setEvents(prevEvents =>
          [...prevEvents, addedEventForState].sort(
            (a, b) => new Date(a.start_at) - new Date(b.start_at)
          )
        );
      }
      handleCloseModal();
    }
  };

  const handleDeleteEvent = async eventId => {
    if (!currentUser) return;
    if (window.confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      const { error } = await supabase
        .from("events")
        .delete()
        .match({ id: eventId, user_id: currentUser.id }); // Güvenlik için user_id kontrolü
      if (error) {
        console.error("Error deleting event:", error);
        alert(`Etkinlik silinirken hata oluştu: ${error.message}`);
      } else {
        setEvents(prevEvents =>
          prevEvents.filter(event => event.id !== eventId)
        );
      }
    }
  };

  const handleToggleEventDone = async eventId => {
    if (!currentUser) return;
    const eventToUpdate = events.find(event => event.id === eventId);
    if (eventToUpdate && eventToUpdate.user_id === currentUser.id) {
      // Sadece kendi etkinliğini değiştirebilir
      const { data, error } = await supabase
        .from("events")
        .update({ is_done: !eventToUpdate.isDone })
        .match({ id: eventId })
        .select()
        .single(); // single() eklendi
      if (error) {
        console.error("Error toggling event done status:", error);
        alert(`Etkinlik durumu güncellenirken hata oluştu: ${error.message}`);
      } else if (data) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId
              ? { ...data, isDone: data.is_done, start_at: data.start_at }
              : event
          )
        );
      }
    }
  };

  const handleEditEventSubmit = async (eventId, newTitle, startAtTimestamp) => {
    if (!currentUser) return;
    const eventToUpdate = events.find(event => event.id === eventId);
    if (eventToUpdate && eventToUpdate.user_id === currentUser.id) {
      // Sadece kendi etkinliğini değiştirebilir
      const { data, error } = await supabase
        .from("events")
        .update({ title: newTitle, start_at: startAtTimestamp })
        .match({ id: eventId })
        .select()
        .single(); // single() eklendi
      if (error) {
        console.error("Error editing event:", error);
        alert(`Etkinlik düzenlenirken hata oluştu: ${error.message}`);
      } else if (data) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId
              ? { ...data, isDone: data.is_done, start_at: data.start_at }
              : event
          )
        );
      }
      handleCloseModal();
    }
  };

  const handleLogin = async () => {
    const email = prompt("Email:");
    const password = prompt("Şifre:");
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) alert(`Giriş hatası: ${error.message}`);
  };

  const handleSignUp = async () => {
    const email = prompt("Kaydolmak için Email:");
    const password = prompt("Şifre belirleyin:");
    const username = prompt("Kullanıcı adı belirleyin:"); // Profil için kullanıcı adı
    if (!email || !password || !username) {
      alert("Tüm alanlar zorunludur.");
      return;
    }
    setLoading(true);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      { email, password }
    );
    if (signUpError) {
      setLoading(false);
      alert(`Kayıt hatası: ${signUpError.message}`);
    } else if (signUpData.user) {
      // Supabase trigger'ı (handle_new_user) profili otomatik oluşturacak,
      // ama username'i trigger'da new.email yerine new.raw_user_meta_data.username gibi almak daha iyi olabilir
      // veya burada manuel profil güncellemesi/oluşturması yapılabilir.
      // Şimdilik trigger'ın email'i username olarak atadığını varsayıyoruz, kullanıcı bunu profil sayfasında güncelleyebilir.
      // VEYA trigger'ı güncelleyip username'i de almasını sağlayabiliriz.
      // Ya da signUp sonrası hemen profile update:
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username: username }) // Trigger'da username set edilmiyorsa bu gerekli
        .eq("id", signUpData.user.id);

      if (profileError) {
        console.warn(
          "Profil kullanıcı adı güncellenirken hata (veya trigger zaten yaptı):",
          profileError.message
        );
      }
      setLoading(false);
      alert(
        "Kayıt başarılı! Lütfen emailinizi doğrulayın (eğer email doğrulaması açıksa)."
      );
    } else {
      setLoading(false);
      alert("Beklenmedik bir durum oluştu kayıt sırasında.");
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) alert(`Çıkış hatası: ${error.message}`);
  };

  const goToPreviousPeriod = () => {
    setStartDisplayDate(prevDate => addMonths(prevDate, -1));
  };
  const goToNextPeriod = () => {
    setStartDisplayDate(prevDate => addMonths(prevDate, 1));
  };
  const today = new Date(); // Bugünün tarihini al

  if (loading && !currentUser && typeof supabase.auth.session === "undefined") {
    // Supabase JS v1 check
    // Supabase JS v2 için bu check daha farklı olabilir, getSession asenkron
    // setLoading(false) auth onAuthStateChange içinde yapılmalı
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ekip Takvimi</h1>
        <div className="auth-controls-and-user">
          {currentUser && profiles.length > 0 && (
            <p>
              Giriş yapıldı:{" "}
              <strong>
                {profiles.find(p => p.id === currentUser.id)?.username ||
                  currentUser.email}
              </strong>
            </p>
          )}
          <div className="auth-controls">
            {currentUser ? (
              <button onClick={handleLogout}>Çıkış Yap</button>
            ) : (
              <>
                <button onClick={handleLogin}>Giriş Yap</button>
                <button onClick={handleSignUp}>Kaydol</button>
              </>
            )}
          </div>
        </div>
      </header>

      {loading && <p>Yükleniyor...</p>}

      {!loading && currentUser && (
        <>
          <UserEventsSummary
            eventsByUser={eventsByUser}
            userColorMap={userColorMap}
            darkenColorFn={darkenColor}
            getContrastColorFn={getContrastColor}
            currentUser={currentUser}
            profiles={profiles}
            onDeleteEvent={handleDeleteEvent}
            onToggleEventDone={handleToggleEventDone}
            onOpenEditModal={handleOpenEditModal}
          />

          <div className="calendar-section-header">
            <h2>6 Aylık Takvim Görünümü</h2>
            <div className="navigation-controls">
              <button onClick={goToPreviousPeriod}>&lt; Önceki Dönem</button>
              <button onClick={goToNextPeriod}>Sonraki Dönem &gt;</button>
            </div>
          </div>

          <SixMonthView
            startDisplayDate={startDisplayDate}
            onDayClick={handleDayClickForNewEvent}
            events={events}
            addMonthsUtil={addMonths}
            userColorMap={userColorMap}
            darkenColorFn={darkenColor}
            getContrastColorFn={getContrastColor}
            profiles={profiles} // Event.js'in profile erişimi için
            today={today}
          />
        </>
      )}
      {!loading && !currentUser && (
        <p>
          Takvimi ve etkinlikleri görmek için lütfen giriş yapın veya kaydolun.
        </p>
      )}

      {selectedDateForNewEvent && !eventToEdit && currentUser && (
        <EventModal
          key="add-modal"
          dateForNewEvent={selectedDateForNewEvent}
          onClose={handleCloseModal}
          onAddEventSubmit={handleAddEventSubmit}
        />
      )}

      {eventToEdit && currentUser && (
        <EventModal
          key={`edit-modal-${eventToEdit.id}`}
          eventToEdit={eventToEdit}
          onClose={handleCloseModal}
          onEditEventSubmit={handleEditEventSubmit}
        />
      )}
    </div>
  );
}

export default App;
