dclassify
=========

[![73rhodes](https://circleci.com/gh/73rhodes/dclassify.svg?style=shield)](https://app.circleci.com/pipelines/github/73rhodes/dclassify)
[![npm version](https://badge.fury.io/js/dclassify.svg)](http://badge.fury.io/js/dclassify)
[![DeepScan grade](https://deepscan.io/api/projects/2827/branches/20464/badge/grade.svg)](https://deepscan.io/dashboard#view=project&pid=2827&bid=20464)

`dclassify` is an optimized Naive Bayesian classifier for NodeJS that goes one step further
than your ordinary binary classifier by introducing a unique "probablility of absence" feature.
In some test cases this has led to a ~10% improvement over conventional binary classifiers.
It designed for classifying items based on a limited set of characteristics (aka "tokens")
rather than for general language processing.

Intro to Machine Learning with Node.JS
--------------------------------------
View [slides](http://73rhodes.github.io/talks/MachineLearning/) from a talk presented
at [OttawaJS](http://ottawajs.org).

Optimization
------------
The "probability of absence" optimization can be enabled with the `applyInverse` option. When
this option is set to `true`, dclassify will calculate probabilities based on the present
tokens as well as the inverse - a probability of absence for tokens that are not present. This is
unconventional but can produce better results when classifying items based on a limited set
of characteristics, especially when some of those characteristics are nearly always present
in one of the categories.

Most binary classifiers work by looking for specific tokens to be present. For example, an
email spam filter might categorize emails by looking for words that are considered spam-related.
It cares about the words that are present, but not about words that are absent, because there
are just too many of them.

In other cases we care if important key ingredients are missing. For example, an animal
without wings is most likely not a bird. And a mobile app without internet connectivity is
most likely not malware. Such "prevalent negatives" can be quite effective if the total set of
tokens is fairly small (say, a few hundred items) and includes such key ingredients. Using the
`applyInverse` option to look for prevalent negatives can significantly improve the results in
such cases.

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
