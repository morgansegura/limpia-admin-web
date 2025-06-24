type Props = {
  children: React.ReactNode;
};

export default function TypographySmall({ children }: Props) {
  return <small className="text-sm leading-none font-medium">{children}</small>;
}
