type Props = {
  children: React.ReactNode;
};

export default function TypographyLead({ children }: Props) {
  return <p className="text-muted-foreground text-xl">{children}</p>;
}
