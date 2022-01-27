---
title: "Loops in Functional Programming 1: What's wrong with for and while?"
labels:
  - Python
  - Haskell
  - writeup
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

To step out of a loop, Python provides a keyword `break` that is often triggered by a condition. The following snippet repeatedly asks the user for an input number and breaks if it greater or equal than 5:


```python
while True:
    x = int(input("please enter a number: "))
    print(x)
    if x >= 5:
        break
```

    please enter a number:  3
    3

    please enter a number:  2
    2

    please enter a number:  5
    5


Because breaking our loop at some point is such a common pattern, Python's `while` keyword has this already built-in and we can simplify the above snippet like this:


```python
x = 0
while x < 5:
    x = int(input("please enter a number: "))
    print(x)
```

    please enter a number:  3
    3

    please enter a number:  2
    2

    please enter a number:  5
    5


Note that we had to define `x` outside of the loop because the condition is checked when we enter the `while` statement. Visually this looks like this:

![loop illustration](./images/loop1-1.svg)

### modifying state

We often want to compute something in a loop and assign the resulting value of the computation to a variable, as we did with `x`. We call `x` the `state` that the loop modifies while iterating through statements. A light adaptation of the example before is this:


```python
x = 0 
while x < 5:
    x = x + 1
print(x)
```

    5


If we need more state than just an index, we would also define it outside of the loop. In the following example, we compute a number and store it in a list `l`:


```python
l = []
i = 0
while i < 10:
    l += [2*i]
    i += 1
print(l)
```

    [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]


We can also store the list and integer in the above snippet in a single state variable showing that conceptually there is not much difference between modifying one or many variables out of a loop:


```python
state = (0, [])
while state[0] < 10:
    state = (state[0] + 1,
             state[1] + [2*state[0]])
    print(state)
```

    (1, [0])
    (2, [0, 2])
    (3, [0, 2, 4])
    (4, [0, 2, 4, 6])
    (5, [0, 2, 4, 6, 8])
    (6, [0, 2, 4, 6, 8, 10])
    (7, [0, 2, 4, 6, 8, 10, 12])
    (8, [0, 2, 4, 6, 8, 10, 12, 14])
    (9, [0, 2, 4, 6, 8, 10, 12, 14, 16])
    (10, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18])


Therefore, no matter whether it is indices, accumulators such as the list or the integer sum, it always falls into the same category of manipulating state.

### looping through collections with for

In addition to `while` loops, we also see a lot of `for` loops in programming languages like Python. A `for` loop brings nothing new because it can easily be converted to a `while` loop. The reason it is used so often, is because it manages the ubiquitous use case of looping through elements of an iterable data structure such as a list for us:


```python
for c in ['a', 'b', 'c']:
    print(c)
```

    a
    b
    c


Writing this as a while loop is a bit clunky. Also, notice that we don't need to declare the `c` variable outside of the loop. `c` _looks_ like local state neatly confined to the `for` block where it is needed (in Python it actually is accesible from outside after the loop has been executed).

## Statements and side effects

Keyword statements, such as `while`, `for`, `break`, and `continue` that control loops, are special in Python: They are always available without import, and the programmer has to know all `35` that Python (v3.8) has. They are protected names that you can't _use_ for a variable as in `break = 5`, and they are different from expressions that can be _assigned_ to a variable as in `a = break`. The thought comes up whether we _need_ to have special statements for loops or whether we cannot express them just as a normal Python expressions with the other programming machinery that Python has to offer.

But more troubling is that loops like the ones above have no return value. They are statements, actions that are executed imperatively, but not expressions that can be evaluated, assigned to a variable and passed as arguments to functions. This severely limits how loops can be used. But, although there is no return value, of course something happens when running a loop. Instead of evaluating to a value, loops perform _side effects_, they execute statements that modify something somewhere else, such as the characters printed on the screen or the value of a variable declared outside of the loop. A `while` or `for` loop without side effect simply has no effect at all.

What's so bad about side effects? To understand this, let's go back in time. Before `while` and `for`, loops were often written as `goto start if condition else continue`. Arguably this is a simpler expression than learning special syntax for `while` and `for`. However, `goto` led to so-called _spaghetti code_ and was therefore heavily critized and banned from many programming languages. Programs with `goto` were jumping around lines so much that it became very difficult to understand what was going on (a chaotic map of slices and dices rather than any regular topology). The structured programming movement advocated the programming with structured blocks instead, subroutine blocks, selection blocks - and iteration blocks such as `while`. These blocks would make sure to hold together what belongs together, disencouraging any uncontrolled long range jumps. Subroutines, for example, return control to the calling line after execution in contrast to `goto` statements that are one-directional.

But `while` still _has_ strange long range interactions: the side effects that we talked about. For the same reasons that the structural programming movement wanted to get rid of `goto`, the purely functional programming community tries to get rid of such side effects (or at least wrapping them in a special construct limiting their reach). Getting rid of side effects also has the advantage that everything becomes an expression (even a print statement) as we will see, and thus amenable to be used with variables, as arguments to functions and so on. This gives enormous power to the programmer. This is what we will explore in this series.

## Converting loops to expressions

In fact, already in Python, a multi-paradigm language, statements with side effects can sometimes also be written as expressions without. Consider the following example related to the `if:` and `else:` statements:


```python
name = "Bob"
if name == "Bob":
    print("It's Bob!")
else:
    print("It's not Bob!")
```

    It's Bob!


As in the loops above, `if: else:` doesn't have a return value here and runs side effects (printing twice). But the same statement can also be written as an expression with a return value:


```python
name = "Bob"
print("It's Bob!" if name == "Bob" else "It's not Bob!")
```

    It's Bob!


We have transformed the `if: else:` statements into an `if else` expression which can be evaluated and thus used directly as an argument to `print`. This version is more compact but more importantly, the `if else` expression has no side effect anymore.

Python also has a technique, called _list comprehension_ to write certain loops as expression. Consider, for example, the following loop that mutates the list `l` with a side effect:


```python
l = []
for i in range(10):
    l.append(i ** 2)
print(l)
```

    [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]


It can be written equally like this without any side effect:


```python
l = [i**2 for i in range(10)]
print(l)
```

    [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]


Python has a similar tool for dictionaries:


```python
d = {"{:d}".format(i): i**2 for i in range(10)}
print(d)
```

    {'0': 0, '1': 1, '2': 4, '3': 9, '4': 16, '5': 25, '6': 36, '7': 49, '8': 64, '9': 81}


All of these examples show, that we can express loops without `for` or `while` statements and side effects in very elegant ways. List and dictionary comprehension immediately make it clear to which variable the computation in a loop is assigned to. However, we have only dealt with the side effect of modifying state in these examples. Can we do something similar with an IO side effect such as printing to the console? Let's have a look:


```python
d = [print(i) for i in range(3)]
print(d)
```

    0
    1
    2
    [None, None, None]


This example is somewhat troubling but insightful. We see that the print side effect is _not_ captured in the d variable and escapes our list comprehension. How would we store a print action in a variable? It turns out that if you think this further, you'll quickly get to something that resembles purely functional programming languages like Haskell/Elm/Purescript. In this series we will show how they use IO types to stay side-effect free and go through many more possibilities to express loops beyond what Python can express.

## Techniques that we'll explore in this series

First, although it is often _not_ the most elegant and concise way, we will show how to express loops side-effect-free through recursion, as a chain of nested function calls. A loop like `for i in range(3): print(i)` becomes `f(f(f(0)))`, where each function prints its argument and then increases it by `1` before passing it on to the next call. There is a simple recipe to translate loops to such recursive functions calls. However, recursion is more general and can express much more. For example, we could recurse twice instead of once inside of a function, which would correspond to looping through a tree structure. Understanding the correspondence between loops and recursion is conceptually extremely helpful to understand other techniques.

The next thing, still more on the conceptual side, we will look at a higher order function called `fix` that can make non-recursive function recurse, somewhat similar to `while` that makes a statement repeat.

Finally, with this background, we'll get into more practical, concise every-day techniques that are used in functional programming, such as list comprehensions and its generalization called monad comprehensions, `folds` that allow passing state from one step to the next, and into a generalization of these techniques called `recursion` schemes that allow to loop through more complex data structures such as trees.

That's it for post number 1
