import PropTypes from "prop-types";
import { StatCard } from "@/components/common";

const ESTADO_POR_COLOR = {
  primary: "neutral",
  success: "ok",
  warning: "warn",
  danger: "crit",
  slate: "neutral",
  zinc: "neutral",
};

export function StatsCard({ title, value, icon, color = "primary", subtitle }) {
  return (
    <StatCard
      label={title}
      value={value}
      icon={icon}
      estado={ESTADO_POR_COLOR[color] ?? "neutral"}
      nota={subtitle}
    />
  );
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType,
  color: PropTypes.oneOf([
    "primary",
    "success",
    "warning",
    "danger",
    "slate",
    "zinc",
  ]),
  subtitle: PropTypes.node,
};
