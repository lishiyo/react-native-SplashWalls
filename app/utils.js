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
