type AyahNumberProps = {
  verseNumber: number;
  verseKey: string;
  onPlay?: () => void;
};

const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicIndic(value: number) {
  return String(value).replace(/\d/g, (digit) => ARABIC_INDIC_DIGITS[Number(digit)]);
}

export function AyahNumber({ verseNumber, verseKey, onPlay }: AyahNumberProps) {
  const contents = (
    <>
      <span className="ayah-number-ornament" aria-hidden="true" />
      <span className="ayah-number-digits" aria-hidden="true">{toArabicIndic(verseNumber)}</span>
    </>
  );

  if (onPlay) {
    return <button type="button" className="ayah-number-marker" onClick={onPlay} aria-label={`Play ayah ${verseKey}`}>{contents}</button>;
  }

  return <span className="ayah-number-marker" role="img" aria-label={`End of ayah ${verseKey}`}>{contents}</span>;
}
