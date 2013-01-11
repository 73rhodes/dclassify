dclassify
=========

Yet another naive bayesian classifier for nodejs. Intended for classifying items based on a limited set of 
characteristics, rather than for language processing tasks.

General-purpose 'Document' and 'DataSet' classes to create arbitrary training and validation data sets.

Training, validation and classify methods.

If the applyInverse option is used, it will calculate probabilities based on the present tokens (as usual),
and also calculate a probability-of-absence for the missing tokens. This is unconventional, but it
produces better results in testing. It works better for classifying ojects based on a rather small set of 
characteristics rather than for, say, the whole English vocabulary.

Usage
-----

This doesn't make any assumptions about the data you want to classify, so first you have to create your own 
Document instances with names and tokens, using whatever kind of tokenization you require, 
``` javascript

    // module dependencies
    var dclassify = require('lib/classifier');

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
