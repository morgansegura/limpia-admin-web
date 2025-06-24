type Props = {
  list: string[];
};

export default function TypographyList({ list }: Props) {
  return (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
      <>
        {list?.map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </>
    </ul>
  );
}
