---
title: "Illustrating the Generalized Central Limit Theorem 1: Exponentials"
labels:
  - exploration
  - statistics 
description: |
   This series is an intuitive, informal, and visual approach to the generalized central limit theorem that explains that sums of random variables converge to normal or alpha-stable distributions. The first part is about the convergence of functions to exponentials. 
---

## Introduction

Exponentials are intimately related to products and multiplication. The most obvious relationship is that the multiplication of exponentials results in an addition of their exponents. But there is another connection which I explore in this post: taking any function to a large power can have them converge locally to exponentials as well.

It turns out that this convergence to exponentials is very helpful understand the generalized central limit theorem that explains not only why most sums of random variables converge to a normal distribution, but also why some others, in particular with asymptotic power-law behaviour, converge to so-called alpha-stable distributions instead of normal.

## A simple identity that explains a lot

The core identity that we will exploit _a lot_ in this post, and that is therefore crucial to understand, is:

$$
e^{x} = \lim_{n \rightarrow \infty} (1 + \frac{x}{n})^n \qquad \text{(1)}
$$

One way to see that the right hand side of the above equation indeed converges to an exponential, is to expand it with the [binomial theorem](https://en.wikipedia.org/wiki/Binomial_theorem#Statement):

$$
(1+\frac{x}{n})^n = 1 + x + \frac{n(n-1)}{n^2}\frac{x^2}{2!} + \frac{n(n-1)(n-2)}{n^3}\frac{x^3}{3!} + \cdots + \frac{n}{n^{n-1}} x^{n-1} + (\frac{x}{n})^n
\qquad \text(2)
$$

In the limit $n \rightarrow \infty$, the _low power_ terms in this equation converge to the [Taylor series](https://en.wikipedia.org/wiki/Taylor_series#Exponential_function) (around zero) of the exponential function:

$$
e^x = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots \qquad (3)
$$

The low power terms in equations (2) and (3) describe the behaviour of the converging, and the exponential functions for small $x$, whereas high power terms describe their behaviour for large values of $|x|$. This means that we can expect the convergence to be most accurate, and quick in the region around $x=0$, within a zone that gradually expands outwards as $n$ grows. Let's get a visual impression of this by plotting the left hand side of equation (1) for a range of increasing $n$. I use the excellent `sympy` package throughout this post for illustrations.

```python
import sympy as sp
x, n, y, alpha = sp.symbols("x, n, y, \alpha")
exp = (1 + x/n)**n
sp.plot(*[exp.subs(n, i) for i in range(10)], sp.exp(x), xlim=(-5, 5), ylim=(-3, 7), legend=True);
```

![png](/images/posts/generalized_central_limit_theorem_1_1_0.png)

It's fascinating how this expression evolves from a constant over a line to an exponential. An interesting, and enlightening aspect of this convergence are the zero crossings of the nth-function that are simple to compute:

$$
(1 + \frac{x_0}{n})^n = 0 \Rightarrow x_0 = -n \qquad (4)
$$

The (single) zero crossing thus moves further and further out to the left as $n$ grows and as the expression converges to the positiv-definite exponential.

## Rescaling the coordinate system for a better look

Imagine now that we change the term within the brackets to something that occurs more often in the wild:

$$
\lim_{n \rightarrow \infty} (1 + x)^n \qquad (5)
$$

We can transform this with a simple trick into something more similar to our core identity in equation (1):

$$
\lim_{n \rightarrow \infty} (1 + \frac{nx}{n})^n \qquad (6)
$$

Another trick helps to explore this limit. Instead of $x$, we look at the stretched coordinate $y=nx$ instead. The above expression will then converge to $e^{y} = e^{nx}$. But can we really just take the limit of parts of the equation and transform any power into an exponential like this? Let's have a look at the corresponding plot:


```python
exp = (1 + n*x/n)**n
sp.plot(*[exp.subs(n, i) for i in range(10)], sp.exp(9*x), xlim=(-4, 4), ylim=(-3, 7), legend=True);
```


![png](/images/posts/generalized_central_limit_theorem_1_4_0.png)


Looks confusing. What should we think about this plot? We can consider the new coordinate $y=nx$ as simply _squeezing_ the coordinate system. An $n$ times larger value of $x$ leads to the same result as before. But in the stretched coordinate system we _can_ still see $\lim_{n \rightarrow \infty}(1+x)^n$ as an exponential! And in fact, if you look at the above plot, only at the part greater than $-1$ which corresponds to the zero crossing that previously was shifted out the the left with growing $n$, you can see this exponential. If you think it is strange to think about $(1+x)^n$ as an expression that converges to an exponential, you'll be even more surprised about what we will do next:

How about looking at the simple equation $x^n$ with our core identity? Can we see it as an exponential as well in the limit of large $n$ in some squeezed coordinate system? Let's try the same trick as before:

$$
\lim_{n \rightarrow \infty} x^n = \lim_{n \rightarrow \infty} (1 + \frac{n(x-1)}{n})^n \qquad (7)
$$

To look at this limit, we can again introduce the shifted and stretched coordinate $y=n(x-1)$ so that this converges to $e^y=e^{n(x-1)}$. In fact, for this one we don't need a new plot because it is simply the same as before but shifted along the $x$ axis by $1$ to the left. And indeed, if you simply look at the plot above, you can immediately see the shifted $x^n$ function. Following our line of thought, this function should resemble an exponential around $x=0$. One way to see that this is indeed the case, is to compare their derivatives at this point. The first derivative of $x^n$ evaluated at $x=1$ is simply $n$, and the derivative of $e^{n(x-1)}$, evaluated at point $1$, is similarly $n$. However, second and higher derivatives are _not_ the same, the exponential derivatives are $n^k$, where $k$ is the number of the derivative, whereas the power derivatives are $n(n-1)\cdots(n-k)$ - they decay. Now you can see the correspondence because _once we go to the limit of $n \rightarrow \infty$_, both will actually look the same, the decay of the power derivatives plays less and less of a role then, and $x^n$ starts to look like $e^{n(x-1)}$ on it's positive branch around $x=1$. The convergence of $\frac{n(n-1)\cdots(n-k)}{n^k} \rightarrow 1$ for $n \rightarrow \infty$ and for $k \ll n$ is actually exactly the same argument as the one we used before when looking at the binomial theorem directly.

## Gaussians and other symmetric exponentials

With these basic insights in our backpack, let's consider a variant of our core identity now that describes what happens to a $1-x^2$ expression when taking it to a large power:

$$
\lim_{n \rightarrow \infty}(1 - \frac{nx^2}{n})^n = e^{-nx^2} \qquad (8)
$$

A plot is insightful:


```python
exp = (1 - n*x**2/n)**n
sp.plot(*[exp.subs(n, i) for i in range(10)], sp.exp(-9*x**2), xlim=(-2, 2), ylim=(-0.5, 1.5), legend=True);
```


![png](/images/posts/generalized_central_limit_theorem_1_7_0.png)


As the identity predicts, the function converges to a Gaussian curve between $-1$ and $1$ - remarkable. Keep in mind that this is in our "stretched" coordinate system $\sqrt{n} x$. So in reality, the function becomes wider and wider, looking more and more like a Gaussian as $n$ grows. In fact, we are not limited to $1-x^2$, because the same holds for this variant:

$$
\lim_{n \rightarrow \infty} (1 - \frac{n|x|^\alpha}{n}) = e^{-n|x|^\alpha} \qquad(9)
$$

Our stretched coordinate system is now $n^{1/\alpha}x$. Here is an overview of the exponentials that this converges to:


```python
sp.plot(*[sp.exp(-9*abs(x)**alpha).subs(alpha, i) for i in range(0, 4)], xlim=(-2, 2), ylim=(-0.5, 1.5), legend=True);
```


![png](/images/posts/generalized_central_limit_theorem_1_9_0.png)


For example, here is and explicit convergence for $\alpha=1$:


```python
exp = (1 - n*x**alpha/n)**n
sp.plot(*[exp.subs(alpha, 1).subs(n, i) for i in range(10)], sp.exp(-9*abs(x)), xlim=(-2, 2), ylim=(-0.5, 1.5), legend=True);
```


![png](/images/posts/generalized_central_limit_theorem_1_11_0.png)


This looks more or less the same as before with a convergence to the exponential for $x<1$. What is particular about exponentials with $0<\alpha<2$ is that, even though there is a maximum at $x=0$, it's first derivative from the positive and negative sides are not zero and the maximum is «pointy». We don't expect anything spectacular to happen when $\alpha$ is greater than $2$ except that the Gaussian becomes a bit flatter on top but let's have a look nevertheless to be complete:


```python
exp = (1 - n*abs(x)**alpha/n)**n
sp.plot(*[exp.subs(alpha, 4).subs(n, i) for i in range(10)], sp.exp(-9*abs(x)**4), xlim=(-2, 2), ylim=(-0.5, 1.5), legend=True);
```


    
![png](/images/posts/generalized_central_limit_theorem_1_13_0.png)
    


## What is this good for

You may wonder what all of this is good for. To understand where and why the above convergence occurs, think about the fact that _locally_ most well-behaved functions can be described with low power exponentials such as $1-cx^2$ around a maximum or $1+cx$ elsewhere. This local description corresponds exactly to the terms we have seen above. This has the dramatic implication that, _if I take a function to the power of $n$, it will locally look like exponentials as n grows_.

For example, take the function $|\cos{x}|$, which has a maxima at multiples of $\pi$. The following plot shows what happens if I take this function to the nth power:


```python
expr = abs(sp.cos(x))**n
sp.plot(*[expr.subs(n,i) for i in range(10)], xlim=(-4, 4), ylim=(-1.5, 1.5), legend=True);
```


    
![png](/images/posts/generalized_central_limit_theorem_1_15_0.png)
    


Can you see how the maxima converge to Gaussian bell curves? Take this polynomial for another example, with a local maximum close to $1$:


```python
expr = ((5 - x**4 + x - 0.1*x**3)/5.5)**n
expr.subs(x, sp.sqrt(n)*x)
sp.plot(*[expr.subs(n,i) for i in range(1, 30, 3)], xlim=(-4, 4), ylim=(-1.5, 1.5));
```


    
![png](/images/posts/generalized_central_limit_theorem_1_17_0.png)
    


Again, convergence of this local maximum to a Gaussian is clearly visible. Furthermore, in the multiplication process, _the global maxima will dominate all other ones_. This means that _any_ bounded function with a single (well-behaved) maximum will converge _globally_ to a Gaussian.

In fact, since this convergence to an exponential is by no means limited to $1-x^2$-like terms, we could make the same argument for any point of the function. This more advanced idea goes like this: when taking a function to the power of $n$, it will locally converge to a Gaussian where its first derivative (but not the second) is zero, that is a local maximum, and it will locally converge to a simple exponential where its first derivative is non-zero. I didn't look at points where 1st and 2nd derivatives are zero, but I am sure there are similar analogies. Thus, as conclusion, taking a «smooth» function to a large power «exponentializes» it so that it will look like min-Gaussian's around it's maxima and exponentials connecting them.
