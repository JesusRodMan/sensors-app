import { format } from "@formkit/tempo";

const formatDate = "DD/MM/YYYY";

export const getFormatDate = (date: string | Date): string => {
  return format(new Date(date), formatDate);
};
