type Props = {
  children: React.ReactNode;
};
export default function TypographyMuted({ children }: Props) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}
