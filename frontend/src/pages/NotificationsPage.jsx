import React, { useEffect, useState } from "react";
import { markRead, myNotifications } from "../services/notificationService";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const res = await myNotifications();
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const onRead = async (id) => {
    await markRead(id);
    load();
  };

  return (
    <div className="page">
      <h2>Notifications</h2>
      {items.map((item) => (
        <div className="list-item" key={item.id}>
          <span>{item.message}</span>
          <span>{item.is_read ? "Read" : "Unread"}</span>
          {!item.is_read ? <button onClick={() => onRead(item.id)}>Mark Read</button> : null}
        </div>
      ))}
    </div>
  );
}
