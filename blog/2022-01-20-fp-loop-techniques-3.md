---
title: "Loops in Functional Programming 2: transforming loops to recursion and back"
class: post
description: "One thing I struggle with when using functional programming languages are loops. There are just so many ways of doing them and even once one has understood a bunch, it always takes me some time until I understand which technique to reach out for. So here it is, my little compendium of techniques and when to use them. This part of the series is about comprehensions from lists to monad."
---

## from list to monad comprehensions

Then, there are comprehensions, known in the Python world mostly as list or dictionary comprehensions. These might seem limited in scope to these two data types, but we will see that a whole class of loops over data types that have a notion of append can be expressed that way. This general technique is called Monad comprehensions.

If there is no external state, and nothing to accumulate, typically list comprehensions work well in functional programming as they do in imperative languages. A simple list comprehension in Python looks like this:

```python
l = [2*i for i in range(10)]
```

In Haskell it is almost the same:

```haskell
a = [2*x | x <- [1..10]]
```

More advanced examples look like this:

```haskell
λ: a = [x + y | x<-[1..10], y<-[1..10], x+y < 5]
λ: a
[2,3,4,3,4,4]
```

that introduce conditions as in Python

```python
>>> [x + y for x in range(1, 10) for y in range(1, 10) if x+y < 5]
[2, 3, 4, 3, 4, 4]
```

Interestingly, in functional languages list comprehensions generalize to much more than just lists and can be used to express many other loops. This technique is called monad-comprehensions. A data-type with a Monad typeclass (think about it as an interface for the purpose of this blog-post) knows how to bind to another member of it. E.g. a list could know that it can bind to another list by appending its elements. Similarly, a data type that represents a print action could bind to another print action by simply printing one statement after another, or a string could know how to bind to another string.

To translate the above list comprehension into Monad do-notation we would write:

```haskell
a = do
  x <- [1..10]
  [2 * x]
```

A more interesting application that shows that we can do more than just the normal comprehensions with the monad syntax would be:

```haskell
a = do
  x <- [1..10]
  [x, 2*x]
```

This _adds_ elements and shows that this not just a simple one per element loop anymore. Its output is:

```
[1,2,2,4,3,6,4,8,5,10,6,12,7,14,8,16,9,18,10,20]
```

But even more interesting, we can loop through other things that bind to each other such as Maybe's:

```haskell
a = [x + y | x <- Just 1, y <- Just 2]
```

and even guards

## filters and maps

The arguably simplest are simple element wise tasks or mutations of a container such as a list, a dictionary (in Python lingo) that don't depend on each other. In functional programming, these would be expressed as filters, maps or reverse maps that look remarkably similar to python loops using the `range` function over some index.

## Right and left folds

Next, we have a technique that is quite common in functional programming called folds. Essentially, folds express looping through a sortable container from the head or from the tail, passing compute state from one computation to another. This is the simple way to express a loop with an accumulator as we have seen above.

When computations start to depend on each other, suddenly order becomes
important in the loop since we can only depend on values that have been
computed prior to the one that we are computing right now.

If we think about a one dimensional array, the easiest orders are end-to-start
or start-to-end that are embodied by right and left folds. Essentially we will
then loop through the array from either end and accumulate some compute state
on the way that we can then reuse later.

However, we could also have more complex compute orders. Think about an array
that where I want to average every neighboring two elements. Yes, I could do
this with a fold, but that would introduce an unnecessary dependency that I
don't need.

## Catamorphisms

And then, finally, we have so-called catamorphisms that generalize the fold idea, allowing us, for example, to "loop" through trees accumulating the values.

One criterium to pick the right technique is how concise a loop can be expressed, but it is equally important how readable it is which depends on the expertise of the reading programmer, and finally how fast it is when executing. We will see that performance considerations also play a big role.

## looping with State Monads

# further reading

- https://duplode.github.io/posts/whats-in-a-fold.html
- https://colah.github.io/posts/2015-09-NN-Types-FP/
