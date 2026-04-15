import { useState } from "react";
import { buildApiUrl } from "../../api/client";
import "./Avatar.css";

function Avatar({ userId, name, size = "md" }) {
  const [imgError, setImgError] = useState(false);

  const initials = (name || "?")
    .split(" ")
    .map((part) => part[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");

  const src = userId ? buildApiUrl(`/api/user/profile-picture/${userId}`) : null;

  if (!src || imgError) {
    return (
      <div className={`avatar avatar-${size} avatar-initials`} aria-label={name}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`avatar avatar-${size}`}
      onError={() => setImgError(true)}
    />
  );
}

export default Avatar;
