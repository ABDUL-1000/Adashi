export const buildInviteLink = (code: string) => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/join/${code}`;
};
