type Props = {
  children: React.ReactNode;
};

export default function TypographyInlineCode({ children }: Props) {
  return (
    <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
}
