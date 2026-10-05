const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/search/TrainCard.jsx', 'utf8');
code = code.replace(/<td className="py-3 px-4 text-slate-400 font-semibold">[^<]*\(Source\)<\/td>/g, '<td className="py-3 px-4 text-slate-400 font-semibold">- (Source)</td>');
code = code.replace(/<td className="py-3 px-4 text-slate-400 font-semibold">[^<]*\(Terminates\)<\/td>/g, '<td className="py-3 px-4 text-slate-400 font-semibold">- (Terminates)</td>');
code = code.replace(/<td className="py-3 px-4 text-slate-400 font-semibold">[^<]*<\/td>/g, '<td className="py-3 px-4 text-slate-400 font-semibold">-</td>');
code = code.replace(/\{stop\.platform\} [^ ]* \{stop\.distance\}km/g, "{stop.platform || 'PF 1'} &bull; {stop.distance} km");
fs.writeFileSync('frontend/src/components/search/TrainCard.jsx', code, 'utf8');
console.log('Cleaned successfully');
