dclassify
=========

Yet another naive bayesian classifier for nodejs.

General-purpose 'Document' and 'DataSet' classes to create arbitrary training and validation data sets.

Training, validation and classify methods.

If the applyInverse option is used, it will calculate probabilities based on the present tokens (as usual),
and also calculate a probability-of-absence for the missing tokens. I think this is unconventional, but it
produces better results in my testing, given that the data uses a very small voculary. It works better for
classifying ojects based on a rather small set of characteristics rather than for, say, the whole English 
vocabulary.

Usage
-----

    var mod = require('lib/classifier');
    
    var Classifier = mod.Classifier;
    var DataSet    = mod.DataSet;
    var Document   = mod.Document;
    
    // 'bad' items
    var item1 = new Document('item1', ['a','b','c']);
    var item2 = new Document('item2', ['a','b','c']);
    var item3 = new Document('item3', ['a','d','e']);

    // 'good' items
    var itemA = new Document('itemA', ['c', 'd']);
    var itemB = new Document('itemB', ['e']);
    var itemC = new Document('itemC', ['b','d','e']);

    var data = new DataSet();
    data.add('bad',  [item1, item2, item3]);    
    data.add('good', [itemA, itemB, itemC]);
    
    var options = {
        applyInverse: true
    };
    
    var classifier = new Classifier(options);
    
    classifier.train(data);
    console.log('Classifier trained.');
    console.log(JSON.stringify(classifier.probabilities, null, 4));
    
    var testDoc = new Document('testDoc', ['b','d', 'e']);    
    var result1 = classifier.classify(testDoc);
    console.log(result1);