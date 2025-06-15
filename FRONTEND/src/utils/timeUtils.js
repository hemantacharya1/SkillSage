export const isWithinInterviewTime = (startTime, duration) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60000); // Convert duration to milliseconds
  
  return now >= start && now <= end;
};

export const getTimeRemaining = (startTime, duration) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60000);
  
  if (now < start) {
    return {
      remaining: start.getTime() - now.getTime(),
      isBeforeStart: true,
      isAfterEnd: false
    };
  }
  
  if (now > end) {
    return {
      remaining: 0,
      isBeforeStart: false,
      isAfterEnd: true
    };
  }
  
  return {
    remaining: end.getTime() - now.getTime(),
    isBeforeStart: false,
    isAfterEnd: false
  };
};

export const formatTimeRemaining = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  };
}; 