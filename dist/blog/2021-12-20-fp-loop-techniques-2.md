---
title: "Loops in Functional Programming 2: transforming loops to recursion and back"
labels:
  - Haskell
  - Python
  - writeup
description: "One thing I struggle with when using functional programming languages are loops. There are just so many ways of doing them and even once one has understood a bunch, it always takes me some time until I understand which technique to reach out for. So here it is, my little compendium of techniques and when to use them. This part of the series is about recursion, tail recursion."
---

## A recipe to transform loops into recursive functions

If you think about a loop as a statement that is repeatedly executed adapting parameters such as an index or storing something in an accumulator parameter, it is fairly clear that you can express this easily via recursion. The function just has to call itself in the end with the adapted parameters and return the final state when reaching the break condition. Here is how to a loop translates into a recursive function:

```python
for i in range(10):
    print("number", i)
```

This becomes

```python
def iterator(index):
    if index == 10:
      return None
    else:
      print(index)
      iterator(index + 1)
```

Calling `iterator(0)`, essentially executes the same loop the previous. This technique can easily translate every loop.

## Transforming recursive functions into loops: tail recursion

A second thing is interesting: whereas a traditional loop can end with `break` or a similar statement, the recursive version now suddenly specifies a return value. It is an expression now that can be evaluated to a simple value. But how about a loop with accumulator?

```python
var = 0
while var < 10:
    var += 2
```

Here is the same loop written as recursion:

```python
def iterator(state)
    if state == 10:
        return state
    else:
      iterator(state + 2)

iterator(0)
```

In fact, _every_ loop decomposes into a state variable, a break condition and an initial value. This means that we can also express _every_ loop with recursion and that even without modifying any external state. To translate any `while` or `for` loop into a recursive function, you simply need to identify the state variables, the variables that are modified from within the loop plus the index variable in `for` loops, and the break condition and plug them into the preceding snippet. The function should return the state when the break condition hits and modify and pass on the state to itself recursively otherwise. The state is then passed from function to function call until the break condition triggers a return statement.

As there is a recipe from `while` loops to recursion, in certain conditions, there is also one back. If you think back about our description you can think about a `for` or `while` loop as a function executing the same statements as the loop, modifying some state variable and then calling itself with the modified state until reaching a break condition. This means that whenever the function calls itself in the _last_ position, it is very easy to translate it into a `while` loop. The term for this situation is _tail call optimization_ and many compilers from the functional programming world know how to do this automatically. Here is an example in Python.

```python
def iterator(acc, start, end):
    if start == end:
        return acc 
    else:
        acc.append(start)
        return iterator(acc, start+1, end)
```

This prints:

```python
>>> print(iterator([], 0, 20))
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
```

This is definitely a tail recursive function in the `else:` part since we simply call itself with modified state. Therefore, we can easily translate this back to a `while` loop:

```python
start = 0
end = 20
acc = []
while start != end:
    acc.append(start)
    start = start + 1

print(acc)
```

```python
>>> print(acc)
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
```

Now, recursion might be able to express everything that `for` or `while` loops can express as well, but it is just more clunky. And this is where the real art starts. As with so many things in computation, the question is not whether I can in principle express something with a construct, but whether I can express it in an elegant and intuitive way. Functional programming has its own constructs to simplify loops and, as in imperative programming, it is rarely required to actually use recursion for common tasks. We'll go into those techniques in the following sections.

## Fix points and recursion

Besides tail recursion, we can look on recursion from another perspective. Imagine writing out a recursive function such as the following:

```python
s = 0
while s < 5:
    s + 1
```

We can write this as recursive function

```python
def f(index):
    if index < 5:
        return f(index+1)
    else:
        return index
```

If we write this recursion out, we essentially get:

```python
s = f(f(f(f(f(0)))))
```

Looping means, from this perspective, reapplying a function to itself many times. This brings up the idea of writing a loop function that takes a function and applies it to itself:

```python
def fakefor(func, init, start, end):
    for i in range(start, end):
        init = func(init)
    return init
```

Functional programming has a function `fix` that is quite similar to `fakefor` that repeats a function infinitely _until the function hits a fixed point_, that is until the argument doesn't change anymore. The strange thing is, that allowing this higher order function `fakefor` that hides an interior `for` or `while` loop, we can express any loop _even without any recursion_.
