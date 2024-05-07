export const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);

  if (!date) return "";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  return day + " " + month;
};

export const settings = {
  API: 'http://localhost:5058/api/',
}

export const colorsList = [
  "#a8193d",
  "#4fcc25",
  "#1ebffa",
  "#8da377",
  "#9975bd",
  "#cf61a1",
  "#240959",
];

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

export const reportError = ({message}: {message: string}) => {
  // send the error to our logging service...
  
}
