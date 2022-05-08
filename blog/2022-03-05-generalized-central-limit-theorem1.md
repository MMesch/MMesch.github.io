---
title: "Illustrating the Generalized Central Limit Theorem 1: Converging to Exponentials"
labels:
  - exploration
  - statistics 
description: |
   This series is an informal, intuitive and visual approach to the generalized central limit theorem. This theorem states that sums of random variables converge to normal but also to alpha-stable distributions. The latter for example in the case of power-law distributions. This first post in the series sets the stage explaining convergence of functions to exponentials in general.
---

## Introduction

Exponentials are intimately related to products and multiplication. The most obvious relationship is that the multiplication of exponentials results in the addition of their exponents. But more importantly, the exponential function describes fractional _growth_, repeatedly growing something in a multiplicative way. To understand this, I highly recommend reading [this](https://betterexplained.com/articles/an-intuitive-guide-to-exponential-functions-e/) and [this](https://betterexplained.com/articles/demystifying-the-natural-logarithm-ln/) article on [betterexplained.com](https://betterexplained.com/), before getting started with this article.

The connection that I explore in this post is that _taking any function to a large power (“growing” them locally) lets them converge locally to exponentials_. It turns out that this convergence to exponentials is extremely helpful to understand the _generalized_ central limit theorem that not only explains why many sums of random variables converge to a normal distributions, but also why some others converge to so-called alpha-stable distributions instead, in particular those with certain asymptotic power-law behaviour.

## A simple identity that explains a lot

Exponentials are related to fractional growth through a core identity that we will use _massively_ in this and the following posts and that is therefore crucial to understand:

$$
e^{x} = \lim_{n \rightarrow \infty} (1 + \frac{x}{n})^n \qquad \text{(1)}
$$

In words, this identity states that, as we take a specific _linear_ function to the power of $n$, it converges to an exponential in the limit. Much of this first post is about showing that we can locally apply this identity to basically _any_ function, which leads us to the surprising conclusion that _any_ function locally converges to different forms of exponentials if we take it to a high power.

One way to see that the right hand side of the equation (1) indeed converges to an exponential is to expand it with the [binomial theorem](https://en.wikipedia.org/wiki/Binomial_theorem#Statement):

$$
(1+\frac{x}{n})^n = 1 + x + \frac{n(n-1)}{n^2}\frac{x^2}{2!} + \frac{n(n-1)(n-2)}{n^3}\frac{x^3}{3!} + \cdots + \frac{n}{n^{n-1}} x^{n-1} + (\frac{x}{n})^n
\qquad \text(2)
$$

In the limit $n \rightarrow \infty$, the _low power_ terms in this equation converge to the [Taylor series](https://en.wikipedia.org/wiki/Taylor_series#Exponential_function) (around zero) of the exponential function:

$$
e^x = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots \qquad (3)
$$

The low power terms in equations (2) and (3) describe the behaviour of the converging, and the exponential functions for small $x$, whereas high power terms describe their behaviour for large values of $|x|$. This means that we can expect the convergence to be most accurate in the region around $x=0$, within a zone that scales with $n$. Let's get a visual impression of this convergence by plotting the right hand side of equation (1) for a range of increasing $n$. I use the excellent `sympy` package throughout this post for illustrations.

```python
import sympy as sp
x, n, y, alpha = sp.symbols("x, n, y, \alpha")
exp = (1 + x/n)**n
sp.plot(*[exp.subs(n, i) for i in range(10)], sp.exp(x), xlim=(-5, 5), ylim=(-3, 7), legend=True);
```

![](/images/posts/generalized_central_limit_theorem_1_1_0.png)

It's fascinating how this expression evolves from a constant ($n=0$) over a line ($n=1$) to something that more closely resembles an exponential. Basically, in the process, we are adding higher and higher powers of $x$ and thus gradually build up the exponential function that has them all.

An interesting, and enlightening aspect of this convergence is the position of the (single) zero crossings of the nth-function that is simple to compute:

$$
(1 + \frac{x_0}{n})^n = 0 \Rightarrow x_0 = -n \qquad (4)
$$

The zero crossing is at position $-n$ and thus moves further and further out to the left as $n$ grows and as the expression accurately resembles the positiv-definite exponential in a larger and larger zone.

## Rescaling the coordinate system for a better look

Imagine now that we change the term within the brackets to something that occurs more often in the wild:

$$
\lim_{n \rightarrow \infty} (1 + x)^n \qquad (5)
$$

This is a simple polynomial, but we can transform this with a simple trick into something more similar to our core identity in equation (1) to look at it with a different eye:

$$
\lim_{n \rightarrow \infty} (1 + \frac{nx}{n})^n \qquad (6)
$$

Another artifice allows exploring this limit and also understand how convergence happens: Instead of $x$, we look at equation (6) in a _zoomed_ coordinate system $y=nx$. The above expression will then converge to $e^{y} = e^{nx}$. In this new coordinate system, an $n$ times _smaller_ value of $x$ leads to the same value than in the old. Therefore in the zoomed coordinates $y$, equation (6) looks exactly like the exponential in equation (1). And in the original, unzoomed coordinates, it looks like a version of equation (1) that gets gradually zoomed as $n$ grows. With this in mind, let's have a look at the plot of equation (6) for a range of $n$.

```python
exp = (1 + n*x/n)**n
sp.plot(*[exp.subs(n, i) for i in range(10)], sp.exp(9*x), xlim=(-4, 4), ylim=(-3, 7), legend=True);
```

![](/images/posts/generalized_central_limit_theorem_1_4_0.png)

Admittedly, this looks a bit confusing. Keep in mind, that we are showing the _unzoomed_ coordinate system above, so we expect to see the equation converging to exponentials that are more and more squashed around $x=0$ as $n$ grows. And in fact, if you look at the above plot, only at the part greater than $x=-1$, you can indeed see them (we have plotted a true exponential for reference).

If you think this was heavy gymnastics, consider this: How about looking at the simple equation $x^n$ in the same way? Can we see it as an exponential in the limit of large $n$ in some coordinate system? Let's try the same trick as before:

$$
\lim_{n \rightarrow \infty} x^n = \lim_{n \rightarrow \infty} (1 + \frac{n(x-1)}{n})^n \qquad (7)
$$

To look at this limit, we now introduce the _shifted and zoomed_ coordinate $y=n(x-1)$. In this coordinate system, equation (7) converges to $e^y=e^{n(x-1)}$. In fact, we don't need a new plot anymore for this, because it is simply the same as before but shifted along the $x$ axis by $1$ to the left. If you simply look at the plot above, you can see the shifted $x^n$ function. Following our line of thought, this function should converge to a squashed exponential around $x=0$ in the plot, and around $x=1$ in equation (7).

One way to see that $x^n$ and $e^y$ resemble each other in the limit of large $n$, is to compare their derivatives at point $x=1$. The first derivative of $x^n$ evaluated at $x=1$ is simply $n$, and the derivative of $e^{n(x-1)}$, evaluated at point $1$, is similarly $n$. However, the second and higher derivatives of these two functions are _not_ the same. The exponential derivatives are $n^k$, where $k$ is the number of the derivative, whereas the power derivatives are $n(n-1)\cdots(n-k)$ - they decay. But _once we go to the limit of $n \rightarrow \infty$_, both will actually look the same, the decay of the power derivatives makes less and less of a _relative_ difference then, and $x^n$ starts to look like $e^{n(x-1)}$ around $x=1$. The convergence of $\frac{n(n-1)\cdots(n-k)}{n^k} \rightarrow 1$ for $n \rightarrow \infty$ and for $k \ll n$ is actually exactly the same argument as the one we used before when looking at the binomial theorem in equation (2) directly.

[Optional example: Concretely, think about $f(x) = x^3$, with low $n$, far from convergence. The values of its first three derivatives at $x=1$ are $f'(x=1)=3, f''(x=1)=6, f'''(x=1)=6$, compared to the first three derivatives of $g(x) = e^{nx}$ at $x=0$ that are $g'(x=0)=3, g''(x=0)=9, g'''(x=0)=27$, a relative difference of 50% in the second and 450% in the third. And now $f(x) = x^20$, with higher $n$, closer to convergence. The values of its first three derivatives at $x=1$ are $f'(x=1)=20, f''(x=1)=380, f'''(x=1)=6840$, compared to the first three derivatives of $g(x) = e^{nx}$ at $x=0$ that are $g'(x=0)=20, g''(x=0)=400, g'''(x=0)=8000$, a much smaller _relative_ difference of 5% in the second and 17% in the third derivative.]

## Nonlinearities 

With these basic insights in our backpack, let's consider a _non-linear_ variant in $x$ of our core identity to explore what happens to an expression like $1-x^2$ when taking it to a large power:

$$
\lim_{n \rightarrow \infty}(1 - \frac{nx^2}{n})^n \qquad (8)
$$

Note that we can't instantly introduce the same zoomed coordinate system as before here, because we introduced a non-linearity in $x$, but not in $n$. But we can introduce a different one, $y=\sqrt{n}x$, now, and in this coordinate system, equation (8) converges to $e^{y} = e^{-nx^2}$. A plot is again insightful to gain confidence in this:

```python
exp = (1 - n*x**2/n)**n
sp.plot(*[exp.subs(n, i) for i in range(10)], sp.exp(-9*x**2), xlim=(-2, 2), ylim=(-0.5, 1.5), legend=True);
```

![](/images/posts/generalized_central_limit_theorem_1_7_0.png)

As expected, our original function, an inverted parabola, converges to a Gaussian bell curve between $-1$ and $1$ once we take it to a high power. Again, this is in our _unstretched_ coordinate system, and we expect this peak to become narrower and narrower, while looking more and more like a Gaussian bell curve, as $n$ grows.

We are actually not limited to $1-x^2$, because the same holds for this variant:

$$
\lim_{n \rightarrow \infty} (1 - \frac{n|x|^\alpha}{n})^n  \qquad(9)
$$

Our zoomed coordinate system is now $n^{1/\alpha}x$, and in this coordinate system, equation (9) converges to $e^y=e^{-n|x|^\alpha}$. Here is an overview of these exponentials for different values of $\alpha$:

```python
sp.plot(*[sp.exp(-9*abs(x)**alpha).subs(alpha, i) for i in range(0, 4)], xlim=(-2, 2), ylim=(-0.5, 1.5), legend=True);
```

![](/images/posts/generalized_central_limit_theorem_1_9_0.png)

And here is the explicit convergence of equation (9) for $\alpha=1$:

```python
exp = (1 - n*x**alpha/n)**n
sp.plot(*[exp.subs(alpha, 1).subs(n, i) for i in range(10)], sp.exp(-9*abs(x)), xlim=(-2, 2), ylim=(-0.5, 1.5), legend=True);
```

![](/images/posts/generalized_central_limit_theorem_1_11_0.png)

This looks more or less the same as before with a convergence to the exponential for $x < 1$. What is particular about exponentials with $0 < \alpha < 2$ is that, even though they have a «pointy» maximum at $x=0$ because there is a discontinuity in their first derivative.

We don't expect anything spectacular to happen when $\alpha$ is greater than $2$ except that the Gaussian becomes a bit flatter on top but let's have a look nevertheless to be complete:

```python
exp = (1 - n*abs(x)**alpha/n)**n
sp.plot(*[exp.subs(alpha, 4).subs(n, i) for i in range(10)], sp.exp(-9*abs(x)**4), xlim=(-2, 2), ylim=(-0.5, 1.5), legend=True);
```
    
![](/images/posts/generalized_central_limit_theorem_1_13_0.png)

A final thought is that we seem screwed if we look at _mixed_ polynomials. Consider, for example, the following equation:

$$
\lim_{n \rightarrow \infty} (1 - (x^2 - x))^n  \qquad(10)
$$

There is no _simple_ zoomed coordinate now, because we get:

$$
\lim_{n \rightarrow \infty} (1 - \frac{(n^{1/2}x)^2 - nx}{n})^n  \qquad(11)
$$

However, think about what happens in the coordinate system $y=nx$:

$$
\lim_{n \rightarrow \infty} (1 - \frac{n^{-1/2}y^2 - y}{n})^n  \qquad(12)
$$

In this coordinate system, the quadratic term in $x$ becomes smaller and smaller compared to the linear $x$ term as $n$ grows, and can eventually be neglected. _The smallest power dominates_ in this perspective, and the reason is that the zoomed coordinate systems we introduce zoom in faster for lower powers of $x$, and we thus look have a more localized perspective.

## What this is good for

You may wonder what all of this is good for. To understand where and why the above convergence can occurs, think about the fact that _locally_ most (well-behaved) functions can be approximated as low power polynomials, such as $1-cx^2$ around a maximum where the first derivative is $0$, or $1+cx$ where it is not. This local description corresponds exactly to the terms we have explored above. This has the dramatic implication that, _if I take a function to the power of $n$, it will locally look like a variant of an exponential as $n$ grows_.

For example, take the function $|\cos{x}|$, which has a maxima at multiples of $\pi$. The following plot shows what happens if I take this function to the nth power:

```python
expr = abs(sp.cos(x))**n
sp.plot(*[expr.subs(n,i) for i in range(10)], xlim=(-4, 4), ylim=(-1.5, 1.5), legend=True);
```
    
![](/images/posts/generalized_central_limit_theorem_1_15_0.png)

Can you see how the maxima converge to Gaussian bell curves? Take this polynomial for another example, with a local maximum close to $1$:

```python
expr = ((5 - x**4 + x - 0.1*x**3)/5.5)**n
expr.subs(x, sp.sqrt(n)*x)
sp.plot(*[expr.subs(n,i) for i in range(1, 30, 3)], xlim=(-4, 4), ylim=(-1.5, 1.5));
```
    
![](/images/posts/generalized_central_limit_theorem_1_17_0.png)

Again, convergence of this local maximum to a Gaussian is clearly visible. Furthermore, in the multiplication process, _the global maxima will dominate all other ones_. This means that _any_ bounded function with a single (well-behaved) maximum will converge _globally_ to a Gaussian.

In fact, since this convergence to an exponential is by no means limited to $1-x^2$-like terms, we could make the same argument for any point of the function. This more advanced idea goes like this: when taking a function to the power of $n$, it will locally converge to a Gaussian where its first derivative (but not the second) is zero, that is a local maximum, and it will locally converge to a simple exponential where its first derivative is non-zero. I didn't look at points where 1st and 2nd derivatives are zero, but I am sure there are similar analogies. Thus, as conclusion, taking a «smooth» function to a large power «exponentializes» it so that it will look like min-Gaussian's around it's maxima and exponentials connecting them.
