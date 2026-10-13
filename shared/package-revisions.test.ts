import {describe,it,expect} from 'vitest';
import {revisedPackageContent} from './package-revisions';
const base={slug:'egypt-discovery-8-days',perPersonRates:{'2':76955,'4':65915,'6':60548,'8':58262,'10':58179,'12':56784},inclusions:[],itinerary:[]};
describe('operator package revision',()=>{
 it('averages all odd rates and is idempotent',()=>{const p=revisedPackageContent(base);expect(p.perPersonRates).toMatchObject({'3':71435,'5':63231.5,'7':59405,'9':58220.5,'11':57481.5});expect(revisedPackageContent(p)).toEqual(p);});
 it('preserves explicit prices and unrelated programs',()=>{expect(revisedPackageContent({...base,perPersonRates:{...base.perPersonRates,'3':72000}}).perPersonRates['3']).toBe(72000);expect(revisedPackageContent({...base,slug:'other'})).toEqual({...base,slug:'other'});});
 it('adds both Luxor temples once to the approved program',()=>{const pkg={...base,slug:'egypt-discovery-11-days',inclusions:['Upper Egypt sightseeing: Philae Temple.'],itinerary:Array.from({length:8},()=>({title:'Day',description:'Following your sightseeing and disembarkation, depart.'}))};const p=revisedPackageContent(pkg);expect(p.inclusions[0]).toContain('Karnak Temple, Luxor Temple');expect(p.itinerary[7].description).toContain('Karnak Temple complex and Luxor Temple');expect(revisedPackageContent(p)).toEqual(p);});
});
