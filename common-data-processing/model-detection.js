
function commonWords(model, variant) {
    const variantWords = variant.split(' ');
    const modelWords = model.split(' ');
    const commonWords = [];
    for (let i = 0; i < modelWords.length && i < variantWords.length && i <= 2; i++) {
        if (modelWords[i] === variantWords[i]) {
            commonWords.push(modelWords[i]);
        }
    }
    return commonWords;
}


export default function detectModel(cars) {

    const variants = cars.map(car => car.variant);


    let model;
    for (let j = 0; j < cars.length; j++) {
        let theCar = cars[j];
        if (!model) {
            model = new Model(firstTwoWords(theCar.variant), manufacturer);
        } else {
            if (theCar.variant !== model.name) {
                const words = commonWords(model.name, theCar.variant);
                if (words.length > 0) {
                    model.name = words.join(' ');
                } else {
                    content.push(model);
                    model = new Model(firstTwoWords(theCar.variant), manufacturer);
                }
            }
        }
        theCar.model = model;
        model.cars.push(theCar);
    }
}

export function firstNWords(variant, n) {
    const words = variant.split(' ');
    if (n !== 0 && words.length >= n) {
        const nWords = words.slice(0, n);
        return nWords.map(word => word.toLowerCase()).join(' ');
    } else {
        return null;
    }
}

export function groupBy(allGroups, testString, getKey) {
    const firstWord = getKey(testString);
    const theGroup = allGroups[firstWord];
    const result = theGroup ? { ...allGroups, [firstWord] : [...theGroup, testString] } : { ...allGroups, [firstWord]: [testString] } ;
    return result;
}

export function nWordsModels(variants, n) {

    variants.sort();

    const groups = variants.reduce((cumul, variant) => groupBy(cumul, variant, s => firstNWords(s, n)), {});

    return groups;
}

export function detectModels(cars) {
    const variants = cars.map(car => car.variant);

    const detectedModels = [];

    for (let i = 1; i < 3; i++) {
        detectedModels.push(nWordsModels(variants, i));
    }

    return detectedModels;
}
