const groupBy = require('lodash.groupby');
const momentG = require('moment');
const momentH = require('moment-hijri');
const momentJ = require('moment-jalaali');

const calendars = require('./calendars');
const languages = require('./languages');
const defaultCountry = require('./defaultCountry');
const events = require('./events');
const preferredCalendars = require('./preferredCalendars');
const weekDays = require('./weekDays');
const weekends = require('./weekends');

const CALENDAR_TYPE_GREGORIAN = 'g';
const CALENDAR_TYPE_ISLAMIC = 'i';
const CALENDAR_TYPE_PERSIAN = 'p';

class AasaamDateTime {
  /**
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @param {Number|String} month
   * @param {Number|String} day
   * @return {String}
   */
  static getEventKey(calendar, month, day) {
    return `${calendar}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`
  }

  /**
   * @returns {String}
   */
  static getTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * @param {('ar'|'az'|'bn'|'de'|'en'|'es'|'fa'|'fr'|'hi'|'id'|'it'|'ja'|'ko'|'ku'|'nl'|'pl'|'ps'|'pt'|'ru'|'sw'|'tr'|'ur'|'zh')} lang Supported language
   * @param {Date|Number} date Standard JavaScript Date object or integer unix time
   */
  constructor(lang = 'fa', date = new Date()) {
    if (date instanceof Date) {
      /** @type {Date} */
      this.date = date;
    } else if (Number.isInteger(date)) {
      this.date = new Date(date * 1000);
    } else {
      throw new Error('Invalid `Date` Object');
    }

    this.date.setMilliseconds(0);

    if (calendars[lang] && languages.includes(lang)) {
      this.lang = lang;
    } else {
      throw new Error('Unsupported language');
    }

    this.changeCountry(defaultCountry[this.lang]);
  }

  /**
   * @param {Date} date Standard JavaScript Date object
   * @return {AasaamDateTime}
   */
  setDate(date) {
    this.date = date;
    this.date.setMilliseconds(0);
    return this;
  }

  /**
   * @param {Number} num Unix time integer
   * @return {AasaamDateTime}
   */
  setUnixTime(num) {
    this.date = new Date(parseInt(num, 10) * 1000);
    return this;
  }

  /**
   * @return {Number}
   */
  getUnixTime() {
    return Math.round(this.date.getTime() / 1000);
  }

  /**
   * @returns {Date}
   */
  getDate() {
    return this.date;
  }

  /**
   * @param {Number} hours Hour number
   * @return {AasaamDateTime}
   */
  setHours(hours) {
    this.date.setHours(hours);
    return this;
  }

  /**
   * @param {Number} minutes Minute number
   * @return {AasaamDateTime}
   */
  setMinutes(minutes) {
    this.date.setMinutes(minutes);
    return this;
  }

  /**
   * @param {Number} seconds Second number
   * @return {AasaamDateTime}
   */
  setSeconds(seconds) {
    this.date.setSeconds(seconds);
    return this;
  }

  /**
   * @param {String} country Country ISO 2 code
   */
  changeCountry(country) {
    this.country = country;

    if (weekDays[this.country]) {
      this.weekDays = weekDays[this.country];
    } else {
      this.weekDays = [1, 2, 3, 4, 5, 6, 0];
    }

    if (preferredCalendars[this.country]) {
      this.calendars = preferredCalendars[this.country];
    } else {
      this.calendars = ['g'];
    }
    if (weekends[this.country]) {
      this.weekend = weekends[this.country];
    } else {
      this.weekend = [6, 0];
    }
    return this;
  }

  /**
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @return {import('moment').Moment|import('moment-jalaali').Moment|import('moment-hijri').Moment}
   */
  getMoment(calendar = undefined) {
    let [cal] = this.calendars;
    if (calendar !== undefined) {
      cal = calendar;
    }
    if (cal === CALENDAR_TYPE_PERSIAN) {
      return momentJ(this.date);
    }

    if (cal === CALENDAR_TYPE_ISLAMIC) {
      return momentH(this.date);
    }

    if (cal === CALENDAR_TYPE_GREGORIAN) {
      return momentG(this.date);
    }

    throw new Error('Calendar not supported');
  }

  /**
   * @param {Number} offset Could be negative or positive number
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @return {AasaamDateTime}
   */
  yearOffset(offset, calendar = undefined) {
    let [cal] = this.calendars;
    if (calendar !== undefined) {
      cal = calendar;
    }
    if (cal === CALENDAR_TYPE_PERSIAN) {
      if (offset >= 0) {
        this.date = momentJ(this.date).add(offset, 'jYear').toDate();
      } else {
        this.date = momentJ(this.date).subtract(offset, 'jYear').toDate();
      }
    } else if (cal === CALENDAR_TYPE_ISLAMIC) {
      if (offset >= 0) {
        this.date = momentH(this.date).add(offset, 'iYear').toDate();
      } else {
        this.date = momentH(this.date).subtract(offset, 'iYear').toDate();
      }
    } else if (cal === CALENDAR_TYPE_GREGORIAN) {
      if (offset >= 0) {
        this.date = momentG(this.date).add(offset, 'year').toDate();
      } else {
        this.date = momentG(this.date).subtract(offset, 'year').toDate();
      }
    } else {
      throw new Error('Calendar not supported');
    }

    return this;
  }

  /**
   * @param {Number} offset Could be negative or positive number
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @return {AasaamDateTime}
   */
  monthOffset(offset, calendar = undefined) {
    let [cal] = this.calendars;
    if (calendar !== undefined) {
      cal = calendar;
    }
    if (cal === CALENDAR_TYPE_PERSIAN) {
      if (offset >= 0) {
        this.date = momentJ(this.date).add(offset, 'jMonth').toDate();
      } else {
        this.date = momentJ(this.date).subtract(offset, 'jMonth').toDate();
      }
    } else if (cal === CALENDAR_TYPE_ISLAMIC) {
      if (offset >= 0) {
        this.date = momentH(this.date).add(offset, 'iMonth').toDate();
      } else {
        this.date = momentH(this.date).subtract(offset, 'iMonth').toDate();
      }
    } else if (cal === CALENDAR_TYPE_GREGORIAN) {
      if (offset >= 0) {
        this.date = momentG(this.date).add(offset, 'month').toDate();
      } else {
        this.date = momentG(this.date).subtract(offset, 'month').toDate();
      }
    } else {
      throw new Error('Calendar not supported');
    }

    return this;
  }

  /**
   * @param {Number} offset Could be negative or positive number
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @return {AasaamDateTime}
   */
  dayOffset(offset, calendar = undefined) {
    let [cal] = this.calendars;
    if (calendar !== undefined) {
      cal = calendar;
    }
    if (cal === CALENDAR_TYPE_PERSIAN) {
      if (offset >= 0) {
        this.date = momentJ(this.date).add(offset, 'day').toDate();
      } else {
        this.date = momentJ(this.date).subtract(offset, 'day').toDate();
      }
    } else if (cal === CALENDAR_TYPE_ISLAMIC) {
      if (offset >= 0) {
        this.date = momentH(this.date).add(offset, 'day').toDate();
      } else {
        this.date = momentH(this.date).subtract(offset, 'day').toDate();
      }
    } else if (cal === CALENDAR_TYPE_GREGORIAN) {
      if (offset >= 0) {
        this.date = momentG(this.date).add(offset, 'day').toDate();
      } else {
        this.date = momentG(this.date).subtract(offset, 'day').toDate();
      }
    } else {
      throw new Error('Calendar not supported');
    }

    return this;
  }

  /**
   * ISO format list
   *
   * Return object contains standard ISO 8601 Date
   * - `H` _Hour, (0-23), one or two digit_ (**۴**)
   * - `HH` _Hour, (00-23), two digit_ (**۰۴**)
   * - `m` _Minute, (0-59), one or two digit_ (**۵**)
   * - `mm` _Minute, (00-59), two digit_ (**۰۵**)
   * - `s` _Second, (0-59), one or two digit_ (**۶**)
   * - `ss` _Second, (00-59), two digit_ (**۰۶**)
   * - `YYYY` _Year according to ISO 8601, at least four digit_ (**۱۳۸۰**)
   * - `YY` _Year according to ISO 8601, at least two digit_ (**۸۰**)
   * - `MMMM` _Month, localized, complete_ (**اردیبهشت**)
   * - `MM` _Month, two digit_ (**۰۲**)
   * - `M` _Month, one or two digit_ (**۲**)
   * - `d` _Day of the month, one or two digit_ (**۹**)
   * - `dd` _Day of the month, two digit_ (**۰۹**)
   * - `E` _Day of the week, localized, number, one char_ (**۱**)
   * - `EEEE` _Day of the week, localized, complete_ (**یکشنبه**)
   * - `EE` _Day of the week, localized, abbreviated, one char_ (**ی**)
   * - `e` _Day of the week, Sunday 0 to Saturday 6_ (**0**)
   * - `G` _Epoch, localized, abbreviated_ (**ه‍.ش.**)
   * - `GGGG` _Epoch, localized, complete_ (**هجری شمسی**)
   * - `zzzz` _Time zone, NOT localized, complete_ (**Asia/Tehran**)
   *
   * @param {('ar'|'az'|'bn'|'de'|'en'|'es'|'fa'|'fr'|'hi'|'id'|'it'|'ja'|'ko'|'ku'|'nl'|'pl'|'ps'|'pt'|'ru'|'sw'|'tr'|'ur'|'zh')} language Supported language
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @return {{H: String, HH: String, m: String, mm: String, s: String, ss: String, YYYY: String, YY: String, MMMM: String, MM: String, M: String, d: String, dd: String, E: String, EEEE: String, EE: String, e: String, G: String, GGGG: String, zzzz: String}}
   */
  isoFormatList(language = undefined, calendar = undefined) {
    let [cal] = this.calendars;
    if (calendar !== undefined) {
      cal = calendar;
    }

    let { lang } = this;
    if (language !== undefined && calendars[language]) {
      // @ts-ignore
      lang = language;
    }

    const numberFormatter = new Intl.NumberFormat(lang, { useGrouping: false });

    const result = {
      // format as locale number
      H: this.date.getHours(),
      m: this.date.getMinutes(),
      s: this.date.getSeconds(),
      YYYY: 0,
      M: 0,
      d: 0,

      // non format locale number
      e: this.date.getDay(),
      EEEE: '',
      EE: '',
      MMMM: '',
      MM: '',
      dd: '',
      zzzz: this.constructor.getTimeZone(),
    };

    result.E = result.e + 1;
    result.EE = calendars[lang].weekNarrow[result.e];
    result.EEEE = calendars[lang].week[result.e];
    result.HH = `${numberFormatter.format(result.H)}`.padStart(2, numberFormatter.format(0));
    result.mm = `${numberFormatter.format(result.m)}`.padStart(2, numberFormatter.format(0));
    result.ss = `${numberFormatter.format(result.s)}`.padStart(2, numberFormatter.format(0));

    if (cal === CALENDAR_TYPE_PERSIAN) {
      const lst = momentJ(this.date).locale('en').format('jYYYY jM jD').split(' ').map((o) => parseInt(o, 10));
      [
        result.YYYY,
        result.M,
        result.d,
      ] = lst;
      result.dd = `${numberFormatter.format(result.d)}`.padStart(2, numberFormatter.format(0));
      result.MM = `${numberFormatter.format(result.M)}`.padStart(2, numberFormatter.format(0));
      result.MMMM = calendars[lang].p.month[result.M - 1];
      result.YY = numberFormatter.format(result.YYYY).slice(-2);
    } else if (cal === CALENDAR_TYPE_ISLAMIC) {
      const lst = momentH(this.date).locale('en').format('iYYYY iM iD').split(' ').map((o) => parseInt(o, 10));
      [
        result.YYYY,
        result.M,
        result.d,
      ] = lst;
      result.dd = `${numberFormatter.format(result.d)}`.padStart(2, numberFormatter.format(0));
      result.MM = `${numberFormatter.format(result.M)}`.padStart(2, numberFormatter.format(0));
      result.MMMM = calendars[lang].i.month[result.M - 1];
      result.YY = numberFormatter.format(result.YYYY).slice(-2);
    } else if (cal === CALENDAR_TYPE_GREGORIAN) {
      const lst = momentG(this.date).locale('en').format('YYYY M D').split(' ').map((o) => parseInt(o, 10));
      [
        result.YYYY,
        result.M,
        result.d,
      ] = lst;
      result.dd = `${numberFormatter.format(result.d)}`.padStart(2, numberFormatter.format(0));
      result.MM = `${numberFormatter.format(result.M)}`.padStart(2, numberFormatter.format(0));
      result.MMMM = calendars[lang].g.month[result.M - 1];
      result.YY = numberFormatter.format(result.YYYY).slice(-2);
    } else {

      throw new Error('Calendar not supported');
    }

    result.G = calendars[lang][cal].nameAbbr;
    result.GGGG = calendars[lang][cal].name;

    const out = {};
    Object.keys(result).forEach((fmt) => {
      const o = result[fmt];
      if (['MMMM', 'G', 'GGGG', 'EE', 'EEE', 'EEEE', 'dd', 'e', 'zzzz', 'HH', 'mm', 'ss', 'YY', 'MM'].includes(fmt)) {
        out[fmt] = o;
      } else {
        out[fmt] = numberFormatter.format(parseInt(o, 10));
      }
    });

    // @ts-ignore
    return out;
  }

  /**
   * ISO format
   *
   * Return object contains standard ISO 8601 Date
   * - `H` _Hour, (0-23), one or two digit_ (**۴**)
   * - `HH` _Hour, (00-23), two digit_ (**۰۴**)
   * - `m` _Minute, (0-59), one or two digit_ (**۵**)
   * - `mm` _Minute, (00-59), two digit_ (**۰۵**)
   * - `s` _Second, (0-59), one or two digit_ (**۶**)
   * - `ss` _Second, (00-59), two digit_ (**۰۶**)
   * - `YYYY` _Year according to ISO 8601, at least four digit_ (**۱۳۸۰**)
   * - `YY` _Year according to ISO 8601, at least two digit_ (**۸۰**)
   * - `MMMM` _Month, localized, complete_ (**اردیبهشت**)
   * - `MM` _Month, two digit_ (**۰۲**)
   * - `M` _Month, one or two digit_ (**۲**)
   * - `d` _Day of the month, one or two digit_ (**۹**)
   * - `dd` _Day of the month, two digit_ (**۰۹**)
   * - `E` _Day of the week, localized, number, one char_ (**۱**)
   * - `EEEE` _Day of the week, localized, complete_ (**یکشنبه**)
   * - `EE` _Day of the week, localized, abbreviated, one char_ (**ی**)
   * - `e` _Day of the week, Sunday 0 to Saturday 6_ (**0**)
   * - `G` _Epoch, localized, abbreviated_ (**ه‍.ش.**)
   * - `GGGG` _Epoch, localized, complete_ (**هجری شمسی**)
   * - `zzzz` _Time zone, NOT localized, complete_ (**Asia/Tehran**)
   *
   * @param {String} format ISO format
   * @param {('ar'|'az'|'bn'|'de'|'en'|'es'|'fa'|'fr'|'hi'|'id'|'it'|'ja'|'ko'|'ku'|'nl'|'pl'|'ps'|'pt'|'ru'|'sw'|'tr'|'ur'|'zh')} language Supported language
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @return {String}
   */
  isoFormat(format, language = undefined, calendar = undefined) {
    const o = this.isoFormatList(language, calendar);
    const formatItems = format.split(' ').map((el) => el.trim());
    const result = [];

    formatItems.forEach((f) => {
      if (o[f]) {
        result.push(o[f]);
      }
    });

    return result.join(' ');
  }

  /**
   * Moment format
   *
   * @param {String} format
   * @param {('ar'|'az'|'bn'|'de'|'en'|'es'|'fa'|'fr'|'hi'|'id'|'it'|'ja'|'ko'|'ku'|'nl'|'pl'|'ps'|'pt'|'ru'|'sw'|'tr'|'ur'|'zh')} language Supported language
   */
  format(format, language = undefined) {
    let { lang } = this;
    if (language !== null && calendars[language]) {
      // @ts-ignore
      lang = language;
    }

    if (format.match(/jM|jD|jw|jYY|jgg/gm)) {
      return momentJ(this.date).locale(lang).format(format);
    }

    if (format.match(/iM|iD|iw|iYY|igg/gm)) {
      return momentH(this.date).locale(lang).format(format);
    }

    return momentG(this.date).locale(lang).format(format);
  }

  /**
   * Moment parse
   *
   * @param {String} str String want to parse
   * @param {String} fmt Formatted string of passed
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @return {AasaamDateTime}
   */
  parse(str, fmt, calendar = undefined) {
    let [cal] = this.calendars;
    if (calendar !== undefined) {
      cal = calendar;
    }

    if (cal === CALENDAR_TYPE_PERSIAN) {
      this.date = momentJ(str, fmt).toDate();
    } else if (cal === CALENDAR_TYPE_ISLAMIC) {
      this.date = momentH(str, fmt).toDate();
    } else if (cal === CALENDAR_TYPE_GREGORIAN) {
      this.date = momentG(str, fmt).toDate();
    } else {
      throw new Error('Calendar not supported');
    }

    return this;
  }

  /**
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @param {Number} offset Offset of before and after
   * @return {{name: String, localeName: String, i: Number, selectedYear: Boolean, date: Date}[]}
   */
  generateYearList(calendar = undefined, offset = 60) {
    let [cal] = this.calendars;
    if (calendar !== undefined) {
      cal = calendar;
    }

    let current;
    if (cal === CALENDAR_TYPE_PERSIAN) {
      current = momentJ(this.date).locale('en').format('jYYYY');
    } else if (cal === CALENDAR_TYPE_ISLAMIC) {
      current = momentH(this.date).locale('en').format('iYYYY');
    } else if (cal === CALENDAR_TYPE_GREGORIAN) {
      current = momentG(this.date).locale('en').format('YYYY');
    } else {
      throw new Error('Calendar not supported');
    }

    const selectedYear = parseInt(current, 10);

    const years = [];
    for (let i = selectedYear - offset; i <= selectedYear + offset; i += 1) {
      let dateObject;
      let f;
      let locale;
      let native;
      if (cal === CALENDAR_TYPE_PERSIAN) {
        dateObject = momentJ(this.date).jYear(i).toDate();
        f = parseInt(momentJ(dateObject).locale('en').format('jYYYY'), 10);
        native = new Intl.NumberFormat('fa', { useGrouping: false }).format(f);
        locale = new Intl.NumberFormat(this.lang, { useGrouping: false }).format(f);
      } else if (cal === CALENDAR_TYPE_ISLAMIC) {
        dateObject = momentH(this.date).iYear(i).toDate();
        f = parseInt(momentH(dateObject).locale('en').format('iYYYY'), 10);
        native = new Intl.NumberFormat('ar', { useGrouping: false }).format(f);
        locale = new Intl.NumberFormat(this.lang, { useGrouping: false }).format(f);
      } else {
        dateObject = momentG(this.date).year(i).toDate();
        f = parseInt(momentG(dateObject).locale('en').format('YYYY'), 10);
        native = f.toString();
        locale = new Intl.NumberFormat(this.lang, { useGrouping: false }).format(f);
      }
      years.push({
        i: f,
        native,
        locale,
        selected: i === selectedYear,
        date: dateObject,
      });
    }
    return years;
  }

  /**
   * @param {('p'|'i'|'g')} calendar Calendar type
   * @return {{name: String, localeName: String, i: Number, selected: Boolean, date: Date}[]}
   */
  generateMonthList(calendar = undefined) {
    let [cal] = this.calendars;
    if (calendar !== undefined) {
      cal = calendar;
    }

    let current;
    if (cal === CALENDAR_TYPE_PERSIAN) {
      current = momentJ(this.date).locale('en').format('jM');
    } else if (cal === CALENDAR_TYPE_ISLAMIC) {
      current = momentH(this.date).locale('en').format('iM');
    } else if (cal === CALENDAR_TYPE_GREGORIAN) {
      current = momentG(this.date).locale('en').format('M');
    } else {
      throw new Error('Calendar not supported');
    }

    const selectedMonth = parseInt(current, 10);

    const monthList = [];
    for (let i = 0; i <= 11; i += 1) {
      let dateObject;
      let native;
      let locale;
      if (cal === CALENDAR_TYPE_PERSIAN) {
        dateObject = momentJ(this.date).jMonth(i).toDate();
        locale = calendars[this.lang].p.month[i];
        native = calendars.fa.p.month[i];
      } else if (cal === CALENDAR_TYPE_ISLAMIC) {
        dateObject = momentH(this.date).iMonth(i).toDate();
        locale = calendars[this.lang].i.month[i];
        native = calendars.ar.i.month[i];
      } else {
        dateObject = momentG(this.date).month(i).toDate();
        locale = calendars[this.lang].g.month[i];
        native = calendars.en.g.month[i];
      }
      monthList.push({
        i,
        native,
        locale,
        selected: selectedMonth === i,
        date: dateObject,
      });
    }
    return monthList;
  }

  /**
   * Get alternate calendar for special date
   *
   * @private
   * @param {Date} date
   * @param {('p'|'i'|'g')} cal Calendar type
   */
  getAlternateCalendarData(date, cal) {
    const eventKeys = [];
    let monthNameNative;
    let monthName;
    let dayLocale;
    let dayNative;
    let monthNumber;
    let i;
    let calendar;
    if (cal === CALENDAR_TYPE_PERSIAN) {
      calendar = 'p';
      const yearNumber = parseInt(momentJ(date).locale('en').format('jYYYY'), 10);
      i = parseInt(momentJ(date).locale('en').format('jD'), 10);

      dayNative = new Intl.NumberFormat('fa', { useGrouping: false }).format(i);
      dayLocale = new Intl.NumberFormat(this.lang, { useGrouping: false }).format(i);

      monthNumber = parseInt(momentJ(date).locale('en').format('jM'), 10);
      monthName = calendars[this.lang].p.month[monthNumber - 1];
      monthNameNative = calendars.fa.p.month[monthNumber - 1];
      eventKeys.push({
        key: this.constructor.getEventKey(cal, monthNumber, i),
        yearNumber,
      });
    } else if (cal === CALENDAR_TYPE_ISLAMIC) {
      calendar = 'i';
      const yearNumber = parseInt(momentH(date).locale('en').format('iYYYY'), 10);
      i = parseInt(momentH(date).locale('en').format('iD'), 10);
      dayNative = new Intl.NumberFormat('ar', { useGrouping: false }).format(i);
      dayLocale = new Intl.NumberFormat(this.lang, { useGrouping: false }).format(i);

      monthNumber = parseInt(momentH(date).locale('en').format('iM'), 10);
      monthName = calendars[this.lang].i.month[monthNumber - 1];
      monthNameNative = calendars.ar.i.month[monthNumber - 1];
      eventKeys.push({
        key: this.constructor.getEventKey(cal, monthNumber, i),
        yearNumber,
      });
    } else {
      calendar = 'g';
      const yearNumber = parseInt(momentG(date).locale('en').format('YYYY'), 10);
      i = parseInt(momentG(date).locale('en').format('D'), 10);
      dayNative = i.toString();
      dayLocale = new Intl.NumberFormat(this.lang, { useGrouping: false }).format(i);
      monthNumber = parseInt(momentH(date).locale('en').format('M'), 10);
      monthName = calendars[this.lang].g.month[monthNumber - 1];
      monthNameNative = calendars.en.g.month[monthNumber - 1];
      eventKeys.push({
        key: this.constructor.getEventKey(cal, monthNumber, i),
        yearNumber,
      });
    }

    return {
      eventKeys,
      calendar,
      dayLocale,
      dayNative,
      monthName,
      monthNumber,
      monthNameNative,
    };
  }

  /**
   * List of days in month
   *
   * @param {('p'|'i'|'g')[]} calendarsList Calendar type list
   * @param {Boolean} addEvents Add
   * @return {{ date: Date, dateOnly: Date, dayNative: String, dayLocale: String, localeDate: String, eventKeys: String[], alt: { calendar: String, dayNative: String, dayLocale: String, monthName: String, monthNameNative: String }[],  weekSeq: Number, selected: Boolean}[]}
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  generateMonthWeekDays(calendarsList = [], addEvents = false) {
    let calendarList = [... this.calendars];
    if (calendarsList.length > 0) {
      calendarList = calendarsList;
    }

    const cal = calendarList.shift();

    let start;
    let daysInMonth;
    if (cal === CALENDAR_TYPE_PERSIAN) {
      start = momentJ(this.date).startOf('jMonth');
      const y = parseInt(start.locale('en').format('jYYYY'), 10);
      const m = parseInt(start.locale('en').format('jM'), 10);
      daysInMonth = momentJ.jDaysInMonth(y, m - 1);
    } else if (cal === CALENDAR_TYPE_ISLAMIC) {
      start = momentH(this.date).startOf('iMonth');
      const y = parseInt(start.locale('en').format('iYYYY'), 10);
      const m = parseInt(start.locale('en').format('iM'), 10);
      daysInMonth = momentH.iDaysInMonth(y, m - 1);
    } else if (cal === CALENDAR_TYPE_GREGORIAN) {
      start = momentG(this.date).startOf('month');
      daysInMonth = start.daysInMonth();
    } else {
      throw new Error('Calendar not supported');
    }

    const selectedDay = momentG(this.date).format('YYYYMMDD');
    const [weekStart] = this.weekDays;
    const days = [];

    let weekSeq = 0;
    for (let i = 1; i <= daysInMonth; i += 1) {
      let eventKeys = [];

      let momentObject;
      let localeDate;
      let dayNative;
      const dayLocale = new Intl.NumberFormat(this.lang, { useGrouping: false }).format(i);

      if (cal === CALENDAR_TYPE_PERSIAN) {
        momentObject = momentJ(this.date).jDate(i);
        const yearNumber = parseInt(momentObject.locale('en').format('jYYYY'), 10);
        localeDate = `${momentObject.locale('en').format('jYYYY')}-${momentObject.locale('en').format('jMM')}-${momentObject.locale('en').format('jDD')}`;
        dayNative = new Intl.NumberFormat('fa', { useGrouping: false }).format(i);
        eventKeys.push({
          key: this.constructor.getEventKey(cal, momentObject.locale('en').format('jMM'), momentObject.locale('en').format('jDD')),
          yearNumber,
        });
      } else if (cal === CALENDAR_TYPE_ISLAMIC) {
        momentObject = momentH(this.date).iDate(i);
        const yearNumber = parseInt(momentObject.locale('en').format('iYYYY'), 10);
        localeDate = `${momentObject.locale('en').format('iYYYY')}-${momentObject.locale('en').format('iMM')}-${momentObject.locale('en').format('iDD')}`;
        dayNative = new Intl.NumberFormat('ar', { useGrouping: false }).format(i);
        eventKeys.push({
          key: this.constructor.getEventKey(cal, momentObject.locale('en').format('iMM'), momentObject.locale('en').format('iDD')),
          yearNumber,
        });
      } else {
        momentObject = momentG(this.date).date(i);
        const yearNumber = parseInt(momentObject.locale('en').format('YYYY'), 10);
        localeDate = `${momentObject.locale('en').format('YYYY')}-${momentObject.locale('en').format('MM')}-${momentObject.locale('en').format('DD')}`;
        dayNative = new Intl.NumberFormat('en', { useGrouping: false }).format(i);
        eventKeys.push({
          key: this.constructor.getEventKey(cal, momentObject.locale('en').format('MM'), momentObject.locale('en').format('DD')),
          yearNumber,
        });
      }

      const dayDate = momentObject.toDate();
      const dateOnly = new Date(dayDate);
      dateOnly.setUTCHours(12, 0, 0, 0);

      const iterateDay = momentG(dayDate).format('YYYYMMDD');

      if (dayDate.getDay() === weekStart) {
        weekSeq += 1;
      }

      const alt = [];
      calendarList.forEach((altCal) => {
        const altResult = this.getAlternateCalendarData(dateOnly, altCal);
        eventKeys = eventKeys.concat(altResult.eventKeys);
        alt.push({
          calendar: altResult.calendar,
          dayNative: altResult.dayNative,
          dayLocale: altResult.dayLocale,
          monthName: altResult.monthName,
          monthNameNative: altResult.monthNameNative,
        });
      });

      const dayResult = {
        date: dayDate,
        dateOnly,
        dayNative,
        dayLocale,
        localeDate,

        holiday: false,
        alt,
        weekSeq,
        weekend: this.weekend.includes(dayDate.getDay()),
        selected: iterateDay === selectedDay,
      };

      if (addEvents) {
        const ev = [];
        eventKeys.forEach(({ key, yearNumber }) => {
          if (events[key]) {
            events[key].forEach((pEvent) => {
              const e = {};
              if (pEvent.year) {
                e.th = yearNumber - pEvent.year;
                e.thLocale = new Intl.NumberFormat(this.lang, { useGrouping: false }).format(yearNumber - pEvent.year);
              }
              if (pEvent.holiday[this.country] && dayResult.holiday === false) {
                dayResult.holiday = true;
              }
              if (pEvent.title[this.lang]) {
                e.title = pEvent.title[this.lang];
              } else {
                e.title = pEvent.title.en;
              }
              ev.push(e);
            });
          }
        });
        dayResult.events = ev;
      }

      days.push(dayResult);

    }
    return {
      calendar: cal,
      days,
    };
  }

  /**
   * @param {('p'|'i'|'g')[]} calendarsList Calendar type list
   * @param {Boolean} addEvents Add
   */
  generateMonthWeekTable(calendarsList = [], addEvents = false) {
    const wdLocale = [];
    this.weekDays.forEach((wn) => {
      wdLocale.push(({
        name: calendars[this.lang].week[wn],
        narrow: calendars[this.lang].weekNarrow[wn],
        weekend: this.weekend.includes(wn),
      }));
    });

    const { calendar, days } = this.generateMonthWeekDays(calendarsList, addEvents);

    const weeksDayList = groupBy(days, (e) => e.weekSeq);

    const r = [];
    Object.values(weeksDayList).forEach((weeks) => {
      /** @type {Array[Object]} */
      const w = [false, false, false, false, false, false, false];
      weeks.forEach((day) => {
        const i = this.weekDays.indexOf(day.date.getDay());

        const dayResult = {
          date: day.date,
          dateOnly: day.dateOnly,
          dayNative: day.dayNative,
          dayLocale: day.dayLocale,
          localeDate: day.localeDate,
          holiday: day.holiday,
          selected: day.selected,
          weekend: day.weekend,
          alt: day.alt,
        };

        if (addEvents && day.events) {
          dayResult.events = day.events;
        }

        w.splice(i, 1, dayResult);
      });
      r.push(w);
    });

    return {
      calendar,
      calendarName: calendars[this.lang][calendar].name,
      calendarNameAbbr: calendars[this.lang][calendar].nameAbbr,
      head: wdLocale,
      weeks: r,
    };
  }
}

module.exports = AasaamDateTime;
