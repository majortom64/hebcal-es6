import test from 'ava';
import greg from './greg';

test('greg2abs', t => {
    let dt = new Date(1995, 11, 17);
    t.is(greg.greg2abs(dt), 728644);
});

test('dayOfYear', t => {
    let dt = new Date(1995, 11, 17);
    t.is(greg.dayOfYear(dt), 351);
});

test('abs2greg', t => {
    let dt = greg.abs2greg(737553);
    t.is(dt.getFullYear(), 2020);
    t.is(dt.getMonth(), 4); // 4=May (January=0)
    t.is(dt.getDate(), 8);
});

test('daysInMonth', t => {
    t.is(greg.daysInMonth(2, 2020), 29);
    t.is(greg.daysInMonth(2, 2019), 28);
    t.is(greg.daysInMonth(5, 2020), 31);
    t.is(greg.daysInMonth(2, 2100), 28);
});

test('LEAP', t => {
    t.is(greg.LEAP(2020), true);
    t.is(greg.LEAP(2019), false);
    t.is(greg.LEAP(2018), false);
    t.is(greg.LEAP(2017), false);
    t.is(greg.LEAP(2016), true);
    t.is(greg.LEAP(2000), true);
    t.is(greg.LEAP(2100), false);
    t.is(greg.LEAP(1980), true);
});

test('monthNames', t => {
    t.is(greg.monthNames[1], "January");
    t.is(greg.monthNames[12], "December");
});
