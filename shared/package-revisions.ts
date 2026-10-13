export const LAUNCH_PACKAGE_SLUGS = ["egypt-discovery-cairo-luxor-6-days", "egypt-discovery-8-days", "egypt-discovery-11-days"];
export function revisedPackageContent<T extends {slug: string; perPersonRates: Record<string,number>; inclusions: string[]; itinerary: {title:string; description:string}[]}>(pkg:T):T {
  if (!LAUNCH_PACKAGE_SLUGS.includes(pkg.slug)) return pkg;
  const rates={...pkg.perPersonRates};
  for(const n of [3,5,7,9,11]) {
    if(rates[String(n)]===undefined && rates[String(n-1)]>0 && rates[String(n+1)]>0)
      rates[String(n)]=Math.round((rates[String(n-1)]*100 + rates[String(n+1)]*100)/2)/100;
  }
  const next={...pkg,perPersonRates:rates};
  if(pkg.slug==='egypt-discovery-11-days') {
    next.inclusions=pkg.inclusions.map(line=>line.startsWith('Upper Egypt sightseeing:') ? line.replace(/\.$/,'') + (line.includes('Karnak Temple')?'':', Karnak Temple') + (line.includes('Luxor Temple')?'':', Luxor Temple') + '.' : line);
    next.itinerary=pkg.itinerary.map((day,index)=>{
      if(index!==7 || (day.description.includes('Karnak Temple') && day.description.includes('Luxor Temple')))return day;
      const visit='Continue to Luxor’s East Bank to explore the monumental Karnak Temple complex and Luxor Temple.';
      return {...day,title:'Luxor’s Royal Tombs, East Bank Temples & Journey to the Red Sea',description:day.description.includes('Following your sightseeing and disembarkation')?day.description.replace('Following your sightseeing and disembarkation',`${visit} Following your sightseeing and disembarkation`):`${day.description}\n\n${visit}`};
    });
  }
  return next;
}
