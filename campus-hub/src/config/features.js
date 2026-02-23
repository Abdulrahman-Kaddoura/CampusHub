const readBooleanEnv = (value, defaultValue = false) => {
  if (typeof value !== "string") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return defaultValue;
};

export const FEATURE_FLAGS = {
  auth: readBooleanEnv(import.meta.env.VITE_ENABLE_AUTH, false),
  housing: readBooleanEnv(import.meta.env.VITE_ENABLE_HOUSING, false),
  tutoring: readBooleanEnv(import.meta.env.VITE_ENABLE_TUTORING, false),
  courseExchange: readBooleanEnv(import.meta.env.VITE_ENABLE_COURSE_EXCHANGE, false),
};

