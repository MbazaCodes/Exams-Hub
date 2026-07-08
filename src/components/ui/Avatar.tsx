interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
}

export function Avatar({ name = "?", src, size = "md", color }: AvatarProps) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = color || "linear-gradient(135deg, var(--indigo), var(--purple))";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar avatar-${size}`}
        style={{ objectFit: "cover" }}
      />
    );
  }

  return (
    <div className={`avatar avatar-${size}`} style={{ background: bg }}>
      {initials}
    </div>
  );
}
