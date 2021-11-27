---
title: "Loops in Functional Programming 1: What's wrong with for and while?"
class: post
description: |
  One thing I struggled with for a long time when using functional programming languages were loops. There are just so many ways of doing them and once one has understood a bunch of techniques, it always takes time and thought to chose one of them. I thought it's worth to structure my thoughts a bit. So here it is, my little compendium of techniques and when to use them. In this first part of the series I'll motivate why we don't use classic techniques known from the imperative world in functional programming. I use Python for imperative style examples and later on switch to Haskell for the functional side.
---

## Loops as we love (?) them in the imperative world

### looping infinitely

Loops are used to repeatedly run a task in imperative programming. There are many ways to express such repetition, and each programming language seems to have different ways with which one can enter a loop. For example, in Python it is possible to write this:

```python
while True:
   print("infinite loop")
```

As soon as the program enters this statement, it will start an infinite loop of print statements. But we rarely want run infinite loops. Somehow we need to stop and step out of it after some time.

### breaking the loop

Python provides a keyword `break` that allows to step out of a loop. A `break` statement is often triggered by a condition. The following snippet asks the user for an input and breaks if the number is smaller than 5:

```python
while True:
    x = input("please enter a number: ")
    print(x)
    if x < 5:
        break
```

But, because we almost always want to break our loop at some point, Python's `while` keyword has this already built-in and we can simplify the above loop like this:

```python
while x < 5:
    x = input("please enter a number: ")
    print(x)
```


### modifying state

Then, although a `while` loop doesn't have a return value and all interesting things it does happen through side effects, we often want to compute something in a loop and store the value of the computation. This is done by first declaring a variable _outside_ of the loop and then modifying it in the loop, again with a side effect:

```python
x = 0 
while x < 5:
    x = x + 1
```

This introduces the two central aspects that we need to express loops: a break condition and a state variable set to an initial value. A `for` loop is a special construct that allows looping through a set of items.

If we need more state than just an index, we would also define it outside of the loops such as the list `l` in the following example:

```python
l = []
i = 0
while i < 10:
    l += [2*i]
    i += 1
```

No matter whether it is indices, accumulators such as the list or sum variable, this always falls into the same category of manipulating state. If we are modifying several at once, we could equally well write them into one combined data structure and then modify it there.

### looping through collections with for

In addition to `while` loops, we also see a lot of `for` loops in programming languages like Python. A `for` loop can easily be expressed as `while` loop. In Python it manages the ubiquitous use case of looping through elements of an iterable data structure such as a list for us:

```python
for c in ['a', 'b', 'c']:
    print(c)
```

A classic use case is to iterate over indices with this.

## for and while: statements and side effects

Keywords such as `break`, `while` or `for` are special in Python: they are always available without any import, you can't use a variable with the same name as in `break = 5` or assign a keyword to a variable such as in `a = break` which throws `SyntaxError`. Python knows a total of `35` such keywords that are special. The thought comes up whether we _need_ to have an keyword for loops or whether we cannot express them just as a normal Python expressions with the usual machinery that Python offers to define expressions.

Another problem is that loops like the ones above _have no return value_. This is because they are _not an expression_ in Python. They are _statements_ that cannot, contrary to an expression, be evaluated to a value. Although there is no return value, of course something happens when running a loop, otherwise we wouldn't write them. But instead of evaluating to a value, loops like the ones shown above perform _side effects_. The above examples illustrate two side effects, printing to the console or mutating the value of a variable.

They all perform some side effect and such side effects are exactly what we avoid in purely functional programming. There Purely functional programming is based on the idea that everything is an expression, depending on nothing else than it's explicit inputs and that can be always evaluated to the same value.

## What can be done about it?

Surprise, Python being quite open about different paradigms allows to express certain statements also as an expression. Consider the following example related to the `if` and `else` statements. The following snippet is an `if/else` expressed as statement:

```python
if name == "Bob":
    print("It's Bob!")
else:
    print("It's not Bob!")
```

This one is an expression with a return value:

```python
output = "It's Bob!" if name == "Bob" else "It's not Bob!"
print(output)
```

The second version not only has the advantage that it is more compact (I could even make it a quite readable one-liner) but the `if/else` expression has no side effect anymore. It just provides the text to print and does nothing else.

A similar technique exists for certain loops called list or dictionary comprehension. The following loop with side effects,

```python
l = []
for i in range(10):
    l.append(i ** 2)
```

, can be changed into this version without:

```python
l = [i**2 for i in range(10)]
```

All of these examples show, that we can express loops without an `for` and `while` statements in a very elegant way. We will go in more depth into list/dictionary comprehensions and how they generalize to something called monad comprehensions in functional programming in a later post and in addition we will say many other techniques that are equally elegant and very powerful.

But first, although it is often _not_ the most elegant and concise way, we will show how to express loops through recursion as a chain of function calls. So that a loop like `for i in range(3): print(i)` is expressed as nested function calls `f(f(f(0)))` where each function prints its argument and then increases it by `1` before passing it on to the next call.While there is a simple recipe to translate loops to recursive functions calls, recursion is more general. For example, we could recurse twice instead of once inside of a function which would correspond to looping through a tree. Understanding the correspondence between loops and recursion is conceptually extremely helpful.

Recursion is great as a basis for understanding how loops can be expressed as functions. However, it is a bit clunky and actually not that often used. The next thing we will visit is a higher order function that makes another non-recursive function recurse, somewhat similar to `while` that makes a statement repeat.

Finally, we'll get into the more practical loop replacements that are used in functional programming, such as list comprehensions and its generalization called monad comprehensions. Another technique are `folds` that, in contrast to monad-comprehensions, allow passing state from one step to the next. When we are doing `folds`, order suddenly becomes important since it matters how the state variable is modified. Finally, we'll dive into a generalization of these technique called `recursion` schemes that allow to loop through more complex data structures such as trees.

That's it for post number 1
