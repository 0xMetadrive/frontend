import { Group, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useForm } from "@mantine/hooks";

interface UploadFileFormValue {
  file?: File;
}

export const UploadFile = () => {
  const form = useForm<UploadFileFormValue>({
    initialValues: {
      file: undefined,
    },
  });

  const handleDropzoneDrop = (files: File[]) => {
    form.setValues({ ...form.values, file: files[0] });
  };

  return (
    <Dropzone onDrop={handleDropzoneDrop} multiple={false}>
      {() => (
        <Group position="center" direction="column">
          {form.values.file ? <Text>{form.values.file.name}</Text> : null}
          <Text weight="semibold">Drag image here or click to select file</Text>
        </Group>
      )}
    </Dropzone>
  );
};
