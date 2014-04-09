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
1. Create Document instances with names and an array of tokens representing the document
