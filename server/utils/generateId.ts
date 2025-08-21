export const generateRegisterId = () => {
    const prefix = "REG";
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${rand}`;
  };