function minifyText(text: string): string {
  text = text.toUpperCase();
  if (text.length <= 6) {
    return text; // Return the original text if it's too short to minimize
  }
  return `0x${text.slice(2, 5)}...${text.slice(-5)}`;
}

export default minifyText;