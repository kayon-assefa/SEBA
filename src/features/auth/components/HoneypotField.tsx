/**
 * Classic honeypot: a field real users never see or fill in, hidden from
 * screen readers too. Simple bots that auto-fill every input on a form
 * will populate it; the submit handler rejects any request where this is
 * non-empty. Not a replacement for the real CAPTCHA + rate limiting —
 * just a free, invisible first filter that catches the dumbest bots
 * without costing a real user anything.
 */
export default function HoneypotField({
  value,
  onChange,
  name = "company_website",
}: {
  value: string;
  onChange: (value: string) => void;
  name?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
    >
      <label htmlFor={name}>Do not fill this in</label>
      <input
        id={name}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
