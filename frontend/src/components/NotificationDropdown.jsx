import React from "react";
import { Link } from "react-router-dom";

export default function NotificationDropdown({ unread }) {
  return (
    <Link className="notif-link" to="/notifications">
      Notifications {unread > 0 ? `(${unread})` : ""}
    </Link>
  );
}
