---
title: "Loops in Functional Programming 1: What's wrong with for and while?"
class: post
description: |
  I struggled with expressing loops a long time when starting to use functional programming languages. There are just so many ways of doing them and once one has understood a bunch of techniques, it always takes time and thought to chose one of them. That's why I thought it's worth to structure my thoughts a bit, starting to write up this little compendium of loop techniques for the functional programmer. In this first part of the series I'll motivate why we don't use classic for and while loops known from the imperative world in functional programming. I use Python for imperative style examples and later on switch to Haskell for the functional.
---

## Loops as we love (?) them in the imperative world

### looping infinitely

Loops are used to repeatedly run a task in imperative programming. There are many ways to express such repetition, and each programming language seems to provide different ways to enter a loop. For example, in Python you can do it like this:

```python
while True:
   print("infinite loop")
```

As soon as the program enters this statement, it will start repeating the print statement in an infinite loop. But we rarely run infinite loops. Somehow we need to stop and step out after some time.

### breaking the loop

To step out of a loop, Python provides a keyword `break` that is often triggered by a condition. The following snippet repeatedly asks the user for an input number and breaks if it is smaller than 5:

```python
while True:
    x = input("please enter a number: ")
    print(x)
    if x < 5:
        break
```

Because breaking our loop at some point is such a common pattern, Python's `while` keyword has this already built-in and we can simplify the above snippet like this:

```python
while x < 5:
    x = input("please enter a number: ")
    print(x)
```


### modifying state

Then, we often want to compute something in a loop and assign the resulting value of the computation to a variable. This is done by first declaring the variable _outside_ of the loop and then modifying it in the loop:

```python
x = 0 
while x < 5:
    x = x + 1
print(x)
```

If we need more state than just an index, we would also define it outside of the loop. In the following example, we compute a number and store it in a list `l`:

```python
l = []
i = 0
while i < 10:
    l += [2*i]
    i += 1
print(l)
```

We can also store the list and integer in the above snippet in a single state variable showing that conceptually there is not much difference between modifying one or many variables out of a loop:

```python
state = (i, [])
while state[0] < 10:
    state = (state[0] + 1, state[1] + [2*i])
print(state[1])
```

Therefore, no matter whether it is indices, accumulators such as the list or sum variable, it always falls into the same category of manipulating state.

### looping through collections with for

In addition to `while` loops, we also see a lot of `for` loops in programming languages like Python. A `for` loop brings nothing new because it can easily be converted to a `while` loop. The reason it is used so often, is because it manages the ubiquitous use case of looping through elements of an iterable data structure such as a list for us:

```python
for c in ['a', 'b', 'c']:
    print(c)
```

Writing this as a while loop is a bit clunky.

## Statements and side effects

Keywords such as `break`, `while` or `for` (other loop specific keywords are `pass` and `continue`) are special in Python: They are always available without importing them, the programmer has to know all `35` of them that Python 3.8 has. They are protected names that you can't use for a variable as in `break = 5`, and they aren't expressions that can be assigned to a variable either as in `a = break`. Special statements thus are an overhead that the programmer has to deal with. The thought comes up whether we _need_ to have special keywords for loops or whether we cannot express them just as a normal Python expressions with the usual machinery that Python offers.

More importantly, loops like the ones above _have no return value_. They are statements, actions that are executed imperatively, but _not expressions_ that can be evaluated, assigned to a variable and passed as arguments to functions. This severely limits how loops can be used. And, although there is no return value, of course something happens when running a loop. Instead of evaluating to a value, loops like the ones shown above perform _side effects_, they execute statements that modify something somewhere else, such as the characters printed on the console or value of a variable declared elsewhere.

Purely functional programming takes the standpoint that such side effects are to be avoided (or wrapped in a special construct limiting their reach that we will see later). It is based on the idea that everything is an expression, and thus amenable to be used with variables, as arguments to functions and so on. We will see that this gives enormous power to the programmer later on.

## Converting loops to expressions

And, already in Python, a multi-paradigm language, certain statements with side effects can also be written as an expression without. Consider the following example related to the `if:` and `else:` statements:

```python
if name == "Bob":
    print("It's Bob!")
else:
    print("It's not Bob!")
```

As in the loops above, `if: else:` doesn't have a return value here and runs side effects (printing twice). But the same statement can also be written as an expression with a return value:

```python
output = "It's Bob!" if name == "Bob" else "It's not Bob!"
print(output)
```

Now, the return value can be assigned to the variable `output`. This version is more compact (I could even make it a one-liner) but more importantly, the `if else` expression has no side effect anymore and it is clear that, whatever it computes is stored in the `output` variable.

Python has a similar technique, called _list comprehension_ (also available for dicts), to write certain loops as expression. Consider, for example, the following loop that mutates the list `l` with a side effect:

```python
l = []
for i in range(10):
    l.append(i ** 2)
```

It can be written equally like this without any side effect:

```python
l = [i**2 for i in range(10)]
```

All of these examples show, that we can express loops without `for` or `while` statements in very elegant ways. In this series we will go through many more possibilities.

## Techniques that we'll explore in this series

First, although it is often _not_ the most elegant and concise way, we will show how to express loops side-effect-free through recursion, as a chain of nested function calls. A loop like `for i in range(3): print(i)` becomes `f(f(f(0)))`, where each function prints its argument and then increases it by `1` before passing it on to the next call. There is a simple recipe to translate loops to such recursive functions calls. However, recursion is more general and can express much more. For example, we could recurse twice instead of once inside of a function, which would correspond to looping through a tree structure. Understanding the correspondence between loops and recursion is conceptually extremely helpful to understand other techniques.

The next thing, still more on the conceptual side, we will look at a higher order function called `fix` that can make non-recursive function recurse, somewhat similar to `while` that makes a statement repeat.

Finally, with this background, we'll get into more practical, concise every-day techniques that are used in functional programming, such as list comprehensions and its generalization called monad comprehensions, `folds` that allow passing state from one step to the next, and into a generalization of these techniques called `recursion` schemes that allow to loop through more complex data structures such as trees.

That's it for post number 1
