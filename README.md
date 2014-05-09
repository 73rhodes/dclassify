dclassify
=========

dclassify is a Naive Bayesian classifier for NodeJS that goes one step further than your
usual binary classifier by introducing a unique probablility-of-absence optimisation. In
testing this optimisation has led to a ~10% improvement in correctness over conventional
binary classifier. It is mainly intended for classifying items based on a finite set of
characteristics, rather than for language processing.

General-purpose Document and DataSet classes are provided for training and test data sets.

If the applyInverse optimization is used, dclassify will calculate probabilities based on
the present tokens as usual, but will also calculate a probability-of-absence for missing
tokens. This is unconventional but produces better results particularly when working with
smaller vocabularies. Its especially well-suited for classifying items based on a limited
set of characteristics.

Usage
-----
1. Require the classifier and reference its utilities.
1. Create Document instances with names and an array of tokens representing the document's characteristics.
1. Add document instances to a DataSet using appropriate categories.
1. Create and train a classifier using the DataSet.
1. Test the classifier using a test Document.

``` javascript

    // module dependencies
    var dclassify = require('dclassify');

    // Utilities provided by dclassify
    var Classifier = dclassify.Classifier;
    var DataSet    = dclassify.DataSet;
    var Document   = dclassify.Document;
    
    // create some 'bad' test items (name, array of characteristics)
    var item1 = new Document('item1', ['a','b','c']);
    var item2 = new Document('item2', ['a','b','c']);
    var item3 = new Document('item3', ['a','d','e']);

    // create some 'good' items (name, characteristics)
    var itemA = new Document('itemA', ['c', 'd']);
    var itemB = new Document('itemB', ['e']);
    var itemC = new Document('itemC', ['b','d','e']);

    // create a DataSet and add test items to appropriate categories
    // this is 'curated' data for training
    var data = new DataSet();
    data.add('bad',  [item1, item2, item3]);    
    data.add('good', [itemA, itemB, itemC]);
    
    // an optimization for working with small vocabularies
    var options = {
        applyInverse: true
    };
    
    // create a classifier
    var classifier = new Classifier(options);
    
    // train the classifier
    classifier.train(data);
    console.log('Classifier trained.');
    console.log(JSON.stringify(classifier.probabilities, null, 4));
    
    // test the classifier on a new test item
    var testDoc = new Document('testDoc', ['b','d', 'e']);    
    var result1 = classifier.classify(testDoc);
    console.log(result1);
```

Output
------

With the test above, here are the probabilities that get calculated:

``` json
    {
        "bad": {
            "a": 1,
            "b": 0.6666666666666666,
            "c": 0.6666666666666666,
            "d": 0.3333333333333333,
            "e": 0.3333333333333333
        },
        "good": {
            "a": 0,
            "b": 0.3333333333333333,
            "c": 0.3333333333333333,
            "d": 0.6666666666666666,
            "e": 0.6666666666666666
        }
    }
```

Without the 'applyInverse' option, this is what you get:

``` json
    {
        "category": "good",
        "probability": 0.6666666666666666,
        "timesMoreLikely": 2,
        "secondCategory": "bad",
        "probabilities": [
            { "category": "good", "probability": 0.14814814814814814},
            { "category": "bad", "probability": 0.07407407407407407}
        ]
    }
```

With the 'applyInverse' option, you get this:

``` json
    {
        "category": "good",
        "probability": 1,
        "timesMoreLikely": "Infinity",
        "secondCategory": "bad",
        "probabilities": [
            { "category": "good", "probability": 0.09876543209876543 },
            { "category": "bad", "probability": 0 }
        ]
    }
```

It's a lot more emphatic, because training indicates bad items never lack the "a" token.
