import ImageUpload from "./ImageUpload";

type Props = {
  value?: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

export default function LogoUpload({
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <ImageUpload
      label="Business logo"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}