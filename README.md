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
