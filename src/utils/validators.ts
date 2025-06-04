export const validatePlayerName = (text: string) => {
  if (text.length === 0) return "Player name must be filled out";
  if (text.length > 20) return "Player name is too long";
  return undefined;
};
