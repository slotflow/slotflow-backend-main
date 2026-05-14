    export const calcPercentage = (current: number, previous: number) => {
      if (previous === 0 && current > 0) return 100;
      if (previous === 0) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };