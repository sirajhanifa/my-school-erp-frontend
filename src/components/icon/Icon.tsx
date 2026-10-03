import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

const Icon = ({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  className,
}: IconProps) => {
  const LucideIcon = Icons[name] as React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
  }>;

  if (!LucideIcon) {
    return null;
  }

  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
};

export default Icon;
