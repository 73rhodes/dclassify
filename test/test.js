var classifier = require('..');
var Classifier = classifier.Classifier;
var DataSet    = classifier.DataSet;
var Document   = classifier.Document;
var assert     = require('assert');

var data = new DataSet();

var item1 = new Document('item1');
item1.add(['a','b','c']);
var item2 = new Document('item2', ['a','b','c']);
var item3 = new Document('item3', ['a','d','e']);
data.add('bad', [item1, item2, item3]);

var itemA = new Document('itemA', ['c', 'd']);
var itemB = new Document('itemB', ['e']);
var itemC = new Document('itemC', ['b','d','e']);
data.add('good', [itemA, itemB, itemC]);

assert.equal(item1.id, "item1");
assert.equal(item1.tokens.length, 3);
assert.equal(data.categorizedItems.bad.length, 3);

console.log('Training data set: ' + JSON.stringify(data, null, 4));

var options = {
    applyInverse: true
};

var classifier1 = new Classifier(options);

classifier1.train(data);
console.log('Classifier trained.');
console.log(JSON.stringify(classifier1.probabilities, null, 4));

var testDoc = new Document('testDoc', ['b','d', 'e']);

var result1 = classifier1.classify(testDoc);
console.log(result1);
assert.equal(result1.category, "good");
assert.equal(result1.probability, 1);

var classifier2 = new Classifier();
classifier2.train(data);
console.log('Classifier trained.');
console.log(JSON.stringify(classifier2.probabilities, null, 4));
assert.equal((classifier2.probabilities.good.c < 1), true);

var result2 = classifier2.classify(testDoc);
console.log(result2);
assert.equal(result2.category, "good");
assert.equal((result2.probability < 1), true);
