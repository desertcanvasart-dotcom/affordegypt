import {describe,it,expect} from 'vitest';
import {packageDatesAvailable} from './package-availability';
describe('ready-made annual holiday exclusion',()=>{
 it('includes both blocked boundaries and crosses years',()=>{
  for(const date of ['2026-12-24','2026-12-31','2027-01-01','2027-01-07']) expect(packageDatesAvailable(date,1)).toBe(false);
  expect(packageDatesAvailable('2026-12-23',2)).toBe(false);
  expect(packageDatesAvailable('2026-12-20',11)).toBe(false);
 });
 it('allows trips entirely outside the excluded period',()=>{
  expect(packageDatesAvailable('2026-12-18',6)).toBe(true);
  expect(packageDatesAvailable('2027-01-08',11)).toBe(true);
 });
});
