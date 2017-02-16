// @flow

export function uniqueRandomNumbers(numRandomNumbers: number, lowerLimit: number, upperLimit: number) {
	const uniqueNumbers = [];
	while (uniqueNumbers.length != numRandomNumbers) {
		let currentRandomNumber = randomNumberInRange(lowerLimit, upperLimit);
		if (uniqueNumbers.indexOf(currentRandomNumber) === -1) {
      uniqueNumbers.push(currentRandomNumber);
    }
	}
	return uniqueNumbers;
}

export function randomNumberInRange(lowerLimit: number, upperLimit: number) {
	return Math.floor( Math.random() * (1 + upperLimit - lowerLimit) ) + lowerLimit;
}

export function distance(x0: number, y0: number, x1: number, y1: number) {
  return Math.sqrt( Math.pow(( x1 - x0 ), 2) + Math.pow(( y1 - y0 ), 2) );
}
