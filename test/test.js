var classifier = require('..');
var Classifier = classifier.Classifier;
var DataSet    = classifier.DataSet;
var Document   = classifier.Document;

var data = new DataSet();

var item1 = new Document('item1', ['a','b','c']);
var item2 = new Document('item2', ['a','b','c']);
var item3 = new Document('item3', ['a','d','e']);
data.add('bad', [item1, item2, item3]);

var itemA = new Document('itemA', ['c', 'd']);
var itemB = new Document('itemB', ['e']);
var itemC = new Document('itemC', ['b','d','e']);
data.add('good', [itemA, itemB, itemC]);

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

var classifier2 = new Classifier();
classifier2.train(data);
console.log('Classifier trained.');
console.log(JSON.stringify(classifier2.probabilities, null, 4));

var result2 = classifier2.classify(testDoc);
console.log(result2);

