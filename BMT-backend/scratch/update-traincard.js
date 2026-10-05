const fs = require('fs');
const filePath = 'frontend/src/components/search/TrainCard.jsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Train types tags
code = code.replace(/\{isVandeBharat && \(\s*<span [^>]*>\s*\? Vande Bharat\s*<\/span>\s*\)\}/g, `{isVandeBharat && (
              <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase shrink-0 inline-flex items-center gap-1">
                <span>⚡</span> Vande Bharat
              </span>
            )}`);

code = code.replace(/\{isRajdhani && \(\s*<span [^>]*>\s*\?\? Rajdhani\s*<\/span>\s*\)\}/g, `{isRajdhani && (
              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full uppercase shrink-0 inline-flex items-center gap-1">
                <span>★</span> Rajdhani
              </span>
            )}`);

code = code.replace(/\{isShatabdi && \(\s*<span [^>]*>\s*\? Shatabdi\s*<\/span>\s*\)\}/g, `{isShatabdi && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase shrink-0 inline-flex items-center gap-1">
                <span>⚡</span> Shatabdi
              </span>
            )}`);

// Quota badge
code = code.replace(/<span>\?<\/span>\s*<span>\{quota === 'TQ' \? 'Tatkal' : quota === 'PT' \? 'Prem\. Tatkal' : quota === 'LD' \? 'Ladies' : 'Senior'\}<\/span>/g,
  `<span>⚡</span><span>{quota === 'TQ' ? 'Tatkal' : quota === 'PT' ? 'Prem. Tatkal' : quota === 'LD' ? 'Ladies' : 'Senior'}</span>`);

// Runs on selected date badges
code = code.replace(/<span>\?\?<\/span>\s*<span>Not on date[^<]*<\/span>/g,
  `<span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span><span>Not on selected date &bull; Runs: {train.runsOn}</span>`);

code = code.replace(/<span>\?\?<\/span>\s*<span>Runs: \{train\.runsOn \|\| 'Daily'\}<\/span>/g,
  `<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span><span>Runs: {train.runsOn || 'Daily'}</span>`);

// Middle track button: trip duration & Stops
const oldMiddleTrack = `<button
              type="button"
              onClick={() => setShowRoute(!showRoute)}
              className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full mb-1 transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
              title="View stops"
            >
              <span>?</span>
              <span>{tripDuration || (stopCount > 0 ? \`\${stopCount} Stops\` : 'Direct')}</span>
              <span>{showRoute ? '?' : '?'}</span>
            </button>`;

const newMiddleTrack = `<button
              type="button"
              onClick={() => setShowRoute(!showRoute)}
              className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full mb-1 transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
              title="View stops & route"
            >
              <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
              </svg>
              <span>{tripDuration || (stopCount > 0 ? \`\${stopCount} Stops\` : 'Direct')}</span>
              <svg className={\`w-2.5 h-2.5 text-emerald-700 transition-transform duration-200 shrink-0 \${showRoute ? 'rotate-180' : ''}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>`;

code = code.replace(oldMiddleTrack, newMiddleTrack);

const oldStopsLink = `<button
              type="button"
              onClick={() => setShowRoute(!showRoute)}
              className="text-[9px] sm:text-[10px] text-emerald-700 hover:text-emerald-800 font-bold mt-0.5 cursor-pointer underline decoration-dotted whitespace-nowrap"
            >
              {showRoute ? 'Hide ?' : 'Stops ?'}
            </button>`;

const newStopsLink = `<button
              type="button"
              onClick={() => setShowRoute(!showRoute)}
              className="text-[9px] sm:text-[10px] text-emerald-700 hover:text-emerald-800 font-bold mt-0.5 cursor-pointer underline decoration-dotted whitespace-nowrap inline-flex items-center gap-1"
            >
              <span>{showRoute ? 'Hide Stops' : (stopCount > 0 ? \`\${stopCount} Stops\` : 'View Stops')}</span>
              <svg className={\`w-2.5 h-2.5 transition-transform duration-200 shrink-0 \${showRoute ? 'rotate-180' : ''}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>`;

code = code.replace(oldStopsLink, newStopsLink);

// AI badge
code = code.replace(/<span className="text-\[10px\] font-bold text-emerald-700 bg-emerald-50 px-2 py-0\.5 rounded-full shrink-0">\s*\? AI\s*<\/span>/g,
  `<span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 inline-flex items-center gap-1">
                <span>⚡</span> AI Forecast
              </span>`);

// AI prediction button icon
code = code.replace(/<span>\?<\/span>\s*<span>\{pred\.probability\}% \{pred\.level === 'CONFIRMED' \? 'CNF' : 'Chance'\}<\/span>/g,
  `<span>{pred.probability >= 80 ? '✓' : '⚡'}</span><span>{pred.probability}% {pred.level === 'CONFIRMED' ? 'CNF' : 'Chance'}</span>`);

// Header of route
code = code.replace(/\{segmentRoute\.origin\?\.stationName\} \? \{segmentRoute\.destination\?\.stationName\}/g,
  `{segmentRoute.origin?.stationName} &rarr; {segmentRoute.destination?.stationName}`);

// Close button in route
code = code.replace(/<span>\?<\/span>\s*<span className="hidden xs:inline">Hide<\/span>/g,
  `<svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg><span className="hidden xs:inline">Hide</span>`);

// Mobile halt badge
code = code.replace(/<span>\?<\/span><span>Halt: \{stop\.halt \|\| '2 min'\}<\/span>/g,
  `<svg className="w-2.5 h-2.5 text-amber-700 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" /></svg><span>Halt: {stop.halt || '2 min'}</span>`);

// Desktop table halt badge
code = code.replace(/<span>\?<\/span><span>\{stop\.halt \|\| '2 min'\}<\/span>/g,
  `<svg className="w-2.5 h-2.5 text-amber-700 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" /></svg><span>{stop.halt || '2 min'}</span>`);

// Clean corrupted platform separator
code = code.replace(/\{stop\.platform\}  \{stop\.distance\}km/g, `{stop.platform || 'PF 1'} &bull; {stop.distance} km`);
code = code.replace(/ \(Source\)/g, '- (Source)');
code = code.replace(/ \(Terminates\)/g, '- (Terminates)');

fs.writeFileSync(filePath, code, 'utf8');
console.log('TrainCard.jsx successfully updated!');
