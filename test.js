const jnug = require('./JNUG_5.json');

const l = jnug.length;

let afterDown = [],
	afterUp = [],
	pctAfterDown = [],
	pctAfterUp = [],
	pctAfterMedDown = [],
	pctAfterMedUp = [],
	pctAfterBigDown = [],
	pctAfterBigUp = [];

let total = 1000;

for(let i = 0; i < l; i++) {

	const today = jnug[i];
	const yesterday = jnug[i-1];

	const change = yesterday ? today.Close - yesterday.Close : 0;

	jnug[i]['Change'] = change;

	
	if (i !== 0) {
		
		// To get percentage change we divide today's change by yesterdays Close
		const pctChange = change / jnug[i-1].Close;
		jnug[i].PercentChange = pctChange;


		if (jnug[i-1].Change > 0) {
			// yesterday was an up day so add today to afterUp
			afterUp.push(change);
			pctAfterUp.push(pctChange);
		} else {
			afterDown.push(change);
			pctAfterDown.push(pctChange);
		}

		// Check for Moderate and Big rises and falls
		if (jnug[i-1].PercentChange > .02) {
			// yesterday was at least a moderate gain day
			pctAfterMedUp.push(pctChange);
			// Now check if it was a big (> 5%) rise day
			if (jnug[i-1].PercentChange > .05) {
				pctAfterBigUp.push(pctChange);
			}
			
		} else if (jnug[i-1].PercentChange < -.02) {
			// yesterday was at least a moderate drop day
			pctAfterMedDown.push(pctChange);
			// now check if it was a big (< -5%) drop day
			if (jnug[i-1].PercentChange < -.05) {
				pctAfterBigDown.push(pctChange);
			}
		}

	}
}


function sortByPctChange(arr, desc) {

	return arr.sort((a,b) => {
		return a.PercentChange - b.PercentChange;
	});
}
function getAverageOfArray(arr) {
	let total = 0;

	arr.forEach((el) => {
		total += el;
	}) 

	const avg = total / arr.length;

	return avg;
}

pctAfterUp = pctAfterUp.map((el) => {
	return el * 100;
})
pctAfterDown = pctAfterDown.map((el) => {
	return el * 100;
})

pctAfterMedUp = pctAfterMedUp.map((el) => {
	return el * 100;
})
pctAfterMedDown = pctAfterMedDown.map((el) => {
	return el * 100;
})

pctAfterBigUp = pctAfterBigUp.map((el) => {
	return el * 100;
})

pctAfterBigDown = pctAfterBigDown.map((el) => {
	return el * 100;
})

const afterUpAVG = getAverageOfArray(pctAfterUp);
const afterDownAVG = getAverageOfArray(pctAfterDown);

const afterMedUpAVG = getAverageOfArray(pctAfterMedUp);
const afterMedDownAVG = getAverageOfArray(pctAfterMedDown);

const afterBigUpAVG = getAverageOfArray(pctAfterBigUp);
const afterBigDownAVG = getAverageOfArray(pctAfterBigDown);

const sorted = sortByPctChange(pctAfterUp);

console.log('# Up Days: ' + afterUp.length);
console.log('# Down Days: ' + afterDown.length);

console.log('# med up days (> 2%) ' + pctAfterMedUp.length);
console.log('# med down days (< -2%) ' + pctAfterMedDown.length);

console.log('# big up days (> 5%) ' + pctAfterBigUp.length);
console.log('# big down days (< -5%) ' + pctAfterBigDown.length);


console.log('AVG following UP days: ' + afterUpAVG + "%");
console.log('AVG following DOWN days : ' + afterDownAVG + "%");

console.log('AVG following MED UP days : ' + afterMedUpAVG + "%");
console.log('AVG following MED DOWN days : ' + afterMedDownAVG + "%");

console.log('AVG following BIG UP days : ' + afterBigUpAVG + "%");
console.log('AVG following BIG DOWN days : ' + afterBigDownAVG + "%");
