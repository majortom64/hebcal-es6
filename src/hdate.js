/* eslint-disable camelcase */
/*
    Hebcal - A Jewish Calendar Generator
    Copyright (c) 1994-2020 Danny Sadinoff
    Portions copyright Eyal Schachter and Michael J. Radwin

    https://github.com/hebcal/hebcal-es6

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License
    as published by the Free Software Foundation; either version 2
    of the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import c from './common';
import greg from './greg';
import {gettext} from 'ttag';

/** Class representing a Hebrew date */
export class HDate {
  /**
   * Create a Hebrew date.
   * @param {number|Date|HDate} [day] - Day of month (1-30)
   * @param {number} [month] - Hebrew month of year (1=NISAN, 7=TISHREI)
   * @param {number} [year] - Hebrew year
   */
  constructor(day, month, year) {
    if (!arguments.length) {
      const d = abs2hebrew(greg.greg2abs(new Date()));
      this.day = d.dd;
      this.month = d.mm;
      this.year = d.yy;
    } else if (arguments.length == 1) {
      if (day instanceof Date) {
        const d = abs2hebrew(greg.greg2abs(day));
        this.day = d.dd;
        this.month = d.mm;
        this.year = d.yy;
      } else if (typeof day == 'number') {
        const d = abs2hebrew(day);
        this.day = d.dd;
        this.month = d.mm;
        this.year = d.yy;
      } else if (day instanceof HDate) {
        this.day = day.day;
        this.month = day.month;
        this.year = day.year;
      } else {
        throw new TypeError(`HDate called with bad argument: ${day}`);
      }
    } else if (arguments.length == 3) {
      // Hebrew day, Hebrew month, Hebrew year
      this.day = this.month = 1;
      this.year = Number(year);
      this.setMonth(c.monthNum(month));
      this.setDate(Number(day));
    } else {
      throw new TypeError('HDate constructor requires 0, 1 or 3 arguments');
    }
  }

  /**
   * Gets the Hebrew year of this Hebrew date
   * @return {number}
   */
  getFullYear() {
    return this.year;
  }

  /**
   * Tests if this date occurs during a leap year
   * @return {boolean}
   */
  isLeapYear() {
    return c.hebLeapYear(this.year);
  }

  /**
   * Gets the Hebrew month (1=NISAN, 7=TISHREI) of this Hebrew date
   * @return {number}
   */
  getMonth() {
    return this.month;
  }

  /** @return {number} */
  getTishreiMonth() {
    const nummonths = c.monthsInHebYear(this.getFullYear());
    return (this.getMonth() + nummonths - 6) % nummonths || nummonths;
  }

  /**
   * Number of days in the month of this Hebrew date
   * @return {number}
   */
  daysInMonth() {
    return c.daysInHebMonth(this.getMonth(), this.getFullYear());
  }

  /**
   * Gets the day within the month (1-30)
   * @return {number}
   */
  getDate() {
    return this.day;
  }

  /**
   * Gets the day of the week, using local time.
   * @return {number}
   */
  getDay() {
    return this.greg().getDay();
  }

  /**
   * @param {number} year
   * @return {HDate}
   */
  setFullYear(year) {
    this.year = year;
    fix(this);
    return this;
  }

  /**
   * @param {number} month
   * @return {HDate}
   */
  setMonth(month) {
    this.month = c.monthNum(month);
    fix(this);
    return this;
  }

  /**
   * @param {number} month
   * @return {HDate}
   */
  setTishreiMonth(month) {
    return this.setMonth((month + 6) % c.monthsInHebYear(this.getFullYear()) || 13);
  }

  /**
   * @param {number} date
   * @return {HDate}
   */
  setDate(date) {
    this.day = date;
    fix(this);
    return this;
  }

  /**
   * Converts to Gregorian date
   * @return {Date}
   */
  greg() {
    return greg.abs2greg(hebrew2abs(this));
  }

  /**
   * Returns Julian absolute days
   * @return {number}
   */
  abs() {
    return hebrew2abs(this);
  }

  /**
   * Returns untranslated Hebrew month name
   * @return {string}
   */
  getMonthName() {
    return c.getMonthName(this.getMonth(), this.getFullYear());
  }

  /**
   * Returns translated/transliterated Hebrew date
   * @return {string}
   */
  render() {
    const day = this.getDate();
    const fullYear = this.getFullYear();
    const monthName = gettext(this.getMonthName());
    return `${day} ${monthName} ${fullYear}`;
  }

  /**
   *
   * @param {number} day day of week
   * @return {HDate}
   */
  before(day) {
    return onOrBefore(day, this, -1);
  }

  /**
   *
   * @param {number} day day of week
   * @return {HDate}
   */
  onOrBefore(day) {
    return onOrBefore(day, this, 0);
  }

  /**
   *
   * @param {number} day day of week
   * @return {HDate}
   */
  nearest(day) {
    return onOrBefore(day, this, 3);
  }

  /**
   *
   * @param {number} day day of week
   * @return {HDate}
   */
  onOrAfter(day) {
    return onOrBefore(day, this, 6);
  }

  /**
   *
   * @param {number} day day of week
   * @return {HDate}
   */
  after(day) {
    return onOrBefore(day, this, 7);
  }

  /**
   *
   * @return {HDate}
   */
  next() {
    return new HDate(this.abs() + 1);
  }

  /**
   *
   * @return {HDate}
   */
  prev() {
    return new HDate(this.abs() - 1);
  }

  /**
   *
   * @param {HDate} other Hebrew date to compare
   * @return {boolean}
   */
  isSameDate(other) {
    if (other instanceof HDate) {
      if (other.getFullYear() == -1) {
        other = new HDate(other).setFullYear(this.getFullYear());
      }
      return this.abs() == other.abs();
    }
    return false;
  }
}

HDate.prototype.toString = function hdateToString() {
  const day = this.getDate();
  const fullYear = this.getFullYear();
  const monthName = this.getMonthName();
  return `${day} ${monthName} ${fullYear}`;
};


// eslint-disable-next-line require-jsdoc
function fix(date) {
  fixMonth(date);
  fixDate(date);
}

// eslint-disable-next-line require-jsdoc
function fixDate(date) {
  if (date.day < 1) {
    if (date.month == c.months.TISHREI) {
      date.year -= 1;
    }
    date.day += c.daysInHebMonth(date.month, date.year);
    date.month -= 1;
    fix(date);
  }
  if (date.day > c.daysInHebMonth(date.month, date.year)) {
    if (date.month == c.months.ELUL) {
      date.year += 1;
    }
    date.day -= c.daysInHebMonth(date.month, date.year);
    date.month += 1;
    fix(date);
  }
  fixMonth(date);
}

// eslint-disable-next-line require-jsdoc
function fixMonth(date) {
  if (date.month == c.months.ADAR_II && !date.isLeapYear()) {
    date.month -= 1; // to Adar I
    fix(date);
  }
  if (date.month < 1) {
    date.month += c.monthsInHebYear(date.year);
    date.year -= 1;
    fix(date);
  }
  if (date.month > c.monthsInHebYear(date.year)) {
    date.month -= c.monthsInHebYear(date.year);
    date.year += 1;
    fix(date);
  }
}

/**
 * @param {number} day
 * @param {HDate} t
 * @param {number} offset
 * @return {HDate}
 */
function onOrBefore(day, t, offset) {
  return new HDate(c.dayOnOrBefore(day, t.abs() + offset));
}

/**
 * A simple Hebrew date
 * @typedef {Object} SimpleHebrewDate
 * @property {number} yy Hebrew year
 * @property {number} mm Hebrew month of year (1=NISAN, 7=TISHREI)
 * @property {number} dd Day of month (1-30)
 */

/**
 * Converts Hebrew date to absolute Julian days.
 * The absolute date is the number of days elapsed since the (imaginary)
 * Gregorian date Sunday, December 31, 1 BC.
 * @param {(HDate|SimpleHebrewDate)} d Hebrew Date
 * @return {number}
 */
export function hebrew2abs(d) {
  const isHDate = d instanceof HDate;
  let tempabs = isHDate ? d.getDate() : d.dd;
  const month = isHDate ? d.getMonth() : d.mm;
  const year = isHDate ? d.getFullYear() : d.yy;

  if (month < c.months.TISHREI) {
    for (let m = c.months.TISHREI; m <= c.monthsInHebYear(year); m++) {
      tempabs += c.daysInHebMonth(m, year);
    }

    for (let m = c.months.NISAN; m < month; m++) {
      tempabs += c.daysInHebMonth(m, year);
    }
  } else {
    for (let m = c.months.TISHREI; m < month; m++) {
      tempabs += c.daysInHebMonth(m, year);
    }
  }

  return c.hebElapsedDays(year) - 1373429 + tempabs;
}

/**
 * Converts Julian days to Hebrew date to absolute Julian days
 * @param {number} d absolute Julian days
 * @return {SimpleHebrewDate}
 */
export function abs2hebrew(d) {
  if (d >= 10555144) {
    throw new RangeError(`parameter to abs2hebrew ${d} out of range`);
  }

  const gregdate = greg.abs2greg(d);
  let year = 3760 + gregdate.getFullYear();
  const hebdate = {
    dd: 1,
    mm: c.months.TISHREI,
    yy: -1,
  };

  while (hebdate.yy = year + 1, d >= hebrew2abs(hebdate)) {
    year++;
  }

  const mmap = [9, 10, 11, 12, 1, 2, 3, 4, 7, 7, 7, 8];
  let month;
  if (year > 4634 && year < 10666) {
    // optimize search
    month = mmap[gregdate.getMonth()];
  } else {
    // we're outside the usual range, so assume nothing about Hebrew/Gregorian calendar drift...
    month = c.months.TISHREI;
  }

  while (hebdate.mm = month,
  hebdate.dd = c.daysInHebMonth(month, year),
  hebdate.yy = year,
  d > hebrew2abs(hebdate)) {
    month = (month % c.monthsInHebYear(year)) + 1;
  }

  hebdate.dd = 1;
  const day = d - hebrew2abs(hebdate) + 1;
  hebdate.dd = day;

  return hebdate;
}

/**
 * Represents an Molad
 * @typedef {Object} Molad
 * @property {number} dow - Day of Week (0=Sunday, 6=Saturday)
 * @property {number} hour - hour of day (0-23)
 * @property {number} minutes - minutes past hour (0-59)
 * @property {number} chalakim - parts of a minute (0-17)
 */

/**
 * Calculates the molad for a Hebrew month
 * @param {number} year
 * @param {number} month
 * @return {Molad}
 */
export function getMolad(year, month) {
  let m_adj = month - 7;
  if (m_adj < 0) {
    m_adj += c.monthsInHebYear(year);
  }

  const m_elapsed = (235 * Math.floor((year - 1) / 19)) + // Months in complete 19 year lunar (Metonic) cycles so far
      (12 * ((year - 1) % 19)) + // Regular months in this cycle
      Math.floor((7 * ((year - 1) % 19) + 1) / 19) + // Leap months this cycle
      m_adj; // add elapsed months till the start of the molad of the month

  const p_elapsed = 204 + Math.floor(793 * (m_elapsed % 1080));

  const h_elapsed = 5 + (12 * m_elapsed) + (793 * Math.floor(m_elapsed / 1080)) + Math.floor(p_elapsed / 1080) - 6;

  const parts = (p_elapsed % 1080) + (1080 * (h_elapsed % 24));

  const chalakim = parts % 1080;

  const day = 1 + (29 * m_elapsed) + Math.floor(h_elapsed / 24);

  const dow = day % 7;

  return {
    dow: dow,
    hour: h_elapsed % 24,
    minutes: Math.floor(chalakim / 18),
    chalakim: chalakim % 18,
  };
}

export default HDate;
