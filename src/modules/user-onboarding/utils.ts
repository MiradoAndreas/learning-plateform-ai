export const getDailyHoursInfo = (hours: number) => {
  if (hours <= 1) {
    return {
      label: "Light",
      description: "Ideal if you have a busy schedule.",
      variant: "secondary" as const,
    };
  }

  if (hours <= 3) {
    return {
      label: "Balanced",
      description: "A sustainable daily learning routine.",
      variant: "default" as const,
    };
  }

  if (hours <= 5) {
    return {
      label: "Focused",
      description: "You'll make faster progress with consistent effort.",
      variant: "outline" as const,
    };
  }

  return {
    label: "Intensive",
    description: "A demanding schedule that requires strong discipline.",
    variant: "destructive" as const,
  };
};
