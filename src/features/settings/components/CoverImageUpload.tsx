import ImageUpload from "./ImageUpload";

type Props = {
  value?: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

export default function CoverImageUpload({
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <ImageUpload
      label="Cover image"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}