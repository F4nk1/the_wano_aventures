export const formatCurrency = (amount: number): string => {
  return `S/. ${amount}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
