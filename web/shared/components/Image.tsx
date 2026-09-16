import { useFileQuery } from "../api/generated.graphql";

export const Image = ({ id, ...props }: { id: string, alt: string, className?: string }) => {
  const { data, loading, error } = useFileQuery({
    variables: { fileId: id },
    skip: !id,
  });
  if (!id) return null;
  if (loading) return null;
  if (error) return <div>Error: {error.message}</div>;

  return <img src={data.file.publicUrl} {...props} />;
};
