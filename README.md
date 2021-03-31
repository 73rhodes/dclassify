dclassify
=========

[![Build Status](https://travis-ci.org/73rhodes/dclassify.svg?branch=master)](https://travis-ci.org/73rhodes/dclassify)
[![npm version](https://badge.fury.io/js/dclassify.svg)](http://badge.fury.io/js/dclassify)
[![DeepScan grade](https://deepscan.io/api/projects/2827/branches/20464/badge/grade.svg)](https://deepscan.io/dashboard#view=project&pid=2827&bid=20464)

`dclassify` is a Naive Bayesian classifier for NodeJS that goes one step further than your
usual binary classifier by introducing a unique "probablility of absence" optimization, also
known as "the prevalent negative". In some test cases this optimization has led to a ~10%
improvement in correctness over conventional binary classifiers. It is mainly intended for
classifying items based on a limited set of characteristics rather than for language
processing; ie. predicting a result based on a limited fixed set of attributes.

General-purpose Document and DataSet classes are provided for training and test data sets.

The probability-of-absence optimization can be enabled using the `applyInverse` option. If
this option is set to `true`, dclassify will calculate probabilities based on the present
tokens as usual, but will also calculate a probability-of-absence for missing tokens. This is
unconventional but produces better results particularly when working with smaller vocabularies.
It is especially well-suited for classifying items based on a limited set of characteristics.

Intro to Machine Learning with Node.JS
---------------------------------------------
View [slides](http://darrenderidder.github.io/talks/MachineLearning) from a talk presented at
[OttawaJS](http://ottawajs.org).

The Prevalent Negative
----------------------
The typical example of a Bayesian classifier is an email filter that categorizes
emails by looking for words that are considered spam-related. In this case we
care about the words (aka. "tokens") that are present. We don't care about words
that are missing.

But in other cases, we care about things that are missing. If a key ingredient
is missing, that could be very important.  For example, birds can fly. If we
created a Bayesian classifier to tell if an animal is a bird, we'd want to know
if the animal can fly. Here, the ability to fly is a "prevalent negative"; if
it's missing, we can be pretty sure the animal is not a bird.

Making use of "prevalent negatives" can be useful if the total set of tokens
is fairly small (say, a few hundred items) and it includes some "key ingredients"
(like with birds, the ability to fly). In these cases, using `applyInverse` option
to look for prevalent negatives can be useful. It checks for tokens that are present
as well as for ones that are missing.

Installation
------------
`npm install dclassify`

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
    
    // an optimisation for working with small vocabularies
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

The output of the above will be:

```javascript
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

Probabilities
-------------

The probabilities get calculated like this.

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

Output
------

Standard results (without the `applyInverse: true` option) would look like this:

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

If you use the `applyInverse: true` option, the results are much more emphatic, because training
indicates bad items never lack the "a" token.

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
