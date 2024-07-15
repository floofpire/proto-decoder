import { copy } from 'copy-paste';

let patchNotes = ``;

patchNotes = patchNotes
  .replaceAll('\\n', '\n')
  .split('\n')
  .map((line) => line.trimEnd())
  .join('\n');

patchNotes = patchNotes
  .replace('New Additions and Optimizations', '## New Additions and Optimizations')
  .replace('New Heroes', '## New Heroes')
  .replace('Hero Adjustments and Changes', '## Hero Adjustments and Changes')
  .replace('Game Adjustments and Optimizations', '## Game Adjustments and Optimizations')
  .replace('Greetings Adventurer,\n\n', '')
  .replace(/Our servers will be unavailable during (<DTime>.*<\/DTime>)[^"]+?\n/, '# 1.1XX.0 XXX server - $1');

const dateRegex = /<DTime>(.*?)<\/DTime>/g;

let m;
while ((m = dateRegex.exec(patchNotes)) !== null) {
  // This is necessary to avoid infinite loops with zero-width matches
  if (m.index === dateRegex.lastIndex) {
    dateRegex.lastIndex++;
  }

  if (m.length !== 2) {
    continue;
  }

  let [fullMatch, stringDate] = m;
  stringDate = stringDate.split(' - ')[0].trim();
  const date = new Date(`${stringDate} UTC`);

  // console.log({ fullMatch, stringDate, date, date2: date.toLocaleString() });

  patchNotes = patchNotes.replaceAll(fullMatch, `<t:${date.getTime() / 1000}:f>`);
}

copy(patchNotes, () => {
  console.log(patchNotes);
});
