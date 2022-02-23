const TIMEZONE = 11;

const generateHourArray = date => Array.from({ length: 76 }, (_, i) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    0,
    i * 48
  )
);

const findClosestInDivisions = (date, divisions) => divisions.reduce((res, time, i, arr) => {
  if (typeof res === 'object') return res;
  const diff = Math.abs(time - date);
  
  return diff < res ? diff : arr[i - 1];
}, Infinity);

const yearDivisionSeconds = date => (new Date(date.getFullYear() + 1, 0, 1, TIMEZONE) - new Date(date.getFullYear(), 0, 1, TIMEZONE)) / 1800 / 1000;
const monthDivisionSeconds = date => new Date(date.getFullYear(), date.getMonth(), 0).getDate() * 24 * 60 * 60 / 1800;
const weekDivisionSeconds = 7 * 24 * 60 * 60 / 1800;

const generateDateDivisions = (startingDate, seconds) => Array.from({ length: 1801 }, (_, i) => new Date(
  startingDate.getFullYear(),
  startingDate.getMonth(),
  startingDate.getDate(),
  TIMEZONE,
  0,
  seconds * i
));

module.exports.generateDateString = (date = new Date()) => {
  const hourDivisions = generateHourArray(date);

  const weekDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay(), TIMEZONE);
  const closestWeek = findClosestInDivisions(date, generateDateDivisions(weekDate, weekDivisionSeconds));
  const monthDate = new Date(date.getFullYear(), date.getMonth(), 1, TIMEZONE);
  const closestMonth = findClosestInDivisions(date, generateDateDivisions(monthDate, monthDivisionSeconds(date)));
  const yearDate = new Date(date.getFullYear(), 0, 1, TIMEZONE);
  const closestYear = findClosestInDivisions(date, generateDateDivisions(yearDate, yearDivisionSeconds(date)));

  const closestSegment = findClosestInDivisions(date, hourDivisions);
  
  const closestWeekSegment = findClosestInDivisions(closestWeek, hourDivisions);
  const closestMonthSegment = findClosestInDivisions(closestMonth, hourDivisions);
  const closestYearSegment = findClosestInDivisions(closestYear, hourDivisions);

  const day = date.getDate();
  const week = Math.min(Math.ceil(date.getDate() / 7), 52);
  const month = date.getMonth();
  const year = date.getFullYear();

  const weekMatcher = closestSegment === closestWeekSegment ? `-WW${week}-` : '';
  const monthMatcher = closestSegment === closestMonthSegment ? `-MM${month}-` : '';
  const yearMatcher = closestSegment === closestYearSegment ? `-YY${year}-` : '';

  return `DD${day}${weekMatcher}${monthMatcher}${yearMatcher}--${closestSegment.toISOString()}`.replace(/\:/g, '-');
}
