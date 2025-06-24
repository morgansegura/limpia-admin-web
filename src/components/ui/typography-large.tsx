type Props = {
  children: React.ReactNode;
};

export default function TypographyLarge({ children }: Props) {
  return <div className="text-lg font-semibold">{children}</div>;
}
