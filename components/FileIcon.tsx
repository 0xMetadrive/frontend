import {
  FileAudio,
  FileCsv,
  FileDoc,
  FileImage,
  FilePdf,
  FileText,
} from "phosphor-react";

interface FileIconProps {
  extension: string;
}

export const FileIcon = ({ extension, ...iconProps }: FileIconProps) => {
  if (["pdf"].includes(extension)) {
    return <FilePdf {...iconProps} />;
  } else if (["jpg", "jpeg", "png"].includes(extension)) {
    return <FileImage {...iconProps} />;
  } else if (["txt"].includes(extension)) {
    return <FileText {...iconProps} />;
  } else if (["mp3"].includes(extension)) {
    return <FileAudio {...iconProps} />;
  } else if (["csv"].includes(extension)) {
    return <FileCsv {...iconProps} />;
  } else if (["doc", "docx"].includes(extension)) {
    return <FileDoc {...iconProps} />;
  } else if (["csv"].includes(extension)) {
    return <FileCsv {...iconProps} />;
  }
};
