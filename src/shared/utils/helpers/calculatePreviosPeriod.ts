export const calculatePreviousPeriod = (startDate: Date, endDate: Date) => {
  const durationInMs = endDate.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - durationInMs);
  const previousEndDate = new Date(startDate.getTime() - 1);

  return { previousStartDate, previousEndDate };
};