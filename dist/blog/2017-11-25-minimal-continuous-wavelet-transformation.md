---
title: Minimal Continuous Wavelet Transform as Python Function
labels:
  - wavelets
  - little trick
  - Python
thumbnail: "/images/thumbnails/continuous_wavelet_transform_test.png"
description: |
  A small, minimal implementation of continuous wavelets in Python.
---

The continuous wavelet transform (CWT) is one of the most handy tools to examine time-frequency content.
Many libraries exist that implement the CWT using different wavelets and methods, but often, I encounter the situation having to include the CWT in my code without a library dependency.
I wrote a minimal version of the CWT that can be copy pasted into any python code and that is flexible and well normalized to be used in most standard settings.
In turned out that it can be compressed to less than 11 lines of active code:

```python
#!/usr/bin/env python

"""Mini implementation of continuous wavelet transform (Morlet wavelet)."""

import numpy as np
import matplotlib.pyplot as plt


def continuous_wavelet_transform(signal, frequencies, time_step=1.0,
                                 wavelet_width=5):
    """
    Minimal continuous morlet wavelet transform.
    Parameters
    ----------
    signal : 1d array_like [npoints] (complex or real)
    time_step : float
    wavelet_width : float (positive)
    frequencies: 1d array_like [nfreqs] (positive real)
    Returns
    -------
    spectrogram: 2d array [len(signal), len(frequencies)] (complex)
        trace convolved with complex morlet wavelets, normalized that:
        np.mean(np.abs(cwt(white_noise, freqs))**2/freqs, axis=1) == 1.
    """

    nfreqs_in, nfreqs_out = len(signal), len(frequencies)

    fsignal = np.fft.fftfreq(nfreqs_in, d=time_step)
    signal_fft = np.fft.fft(signal)

    wavelet_fft = np.zeros((nfreqs_out, nfreqs_in), dtype=np.complex128)
    norm = (wavelet_width + (2 + wavelet_width**2)**.5) / 2
    scales = norm / frequencies
    fpositive = fsignal > 0
    freqs_times_scales = fsignal[None, :] * scales[:, None]
    wavelet_fft[:, fpositive] = (norm / np.sqrt(np.pi))**.5 \
        * np.exp((-(freqs_times_scales[:, fpositive] - wavelet_width)**2) / 2)

    wavelet_fft *= signal_fft
    return np.fft.ifft(np.nan_to_num(wavelet_fft), axis=1)


def test_white_noise():
    # test white noise
    np.random.seed(1)
    npts = 2**16
    freqs = np.fft.rfftfreq(npts)
    df = freqs[1] - freqs[0]
    nfreqs = len(freqs)
    coeffs = np.random.normal(loc=0., scale=1., size=nfreqs) + \
        1j * np.random.normal(loc=0., scale=1., size=nfreqs)

    # distribute variance 1 over 1 Hz, from -Nyq - > Nyq (real fft)
    coeffs /= np.sqrt(2)  # power per coeff -> 1
    coeffs /= np.sqrt(nfreqs)  # power of domain 0 -> Nyquist is 1
    coeffs /= np.sqrt(2)  # power of domain -Nyquist - Nyquist is 1
    power_per_Hz = np.abs(coeffs)**2 / df  # per sample -> per Hz
    mean_power_per_Hz = np.mean(power_per_Hz)
    signal = np.fft.irfft(coeffs) * npts

    nfreqs = 200
    fs = 2 * freqs.max()
    dt = 1. / fs
    freqs = np.linspace(1e-5, fs / 2, nfreqs)

    spectrogram = continuous_wavelet_transform(signal, freqs, dt, 50)
    power = np.abs(spectrogram)**2
    power_per_Hz = power / freqs[:, None]

    fig, ((ax_signal, ax_empty), (ax_cwt, ax_power)) = plt.subplots(
        2, 2,
        gridspec_kw={'height_ratios': [0.2, 1], 'width_ratios': [1, 0.2]},
        sharey='row', sharex='col', figsize=(10, 5))
    ax_empty.set_visible(False)
    ax_signal.plot(signal)
    ax_signal.set(ylabel='signal amplitude')
    ax_cwt.imshow(power_per_Hz, extent=(0, npts * dt, freqs[0], freqs[-1]),
                  aspect='auto', origin='lower')
    ax_cwt.set(xlabel='time [s]', ylabel='frequency [Hz]')
    ax_power.plot([mean_power_per_Hz, mean_power_per_Hz],
                  [freqs[0], freqs[-1]], c='0.7')
    ax_power.plot(np.mean(power_per_Hz, axis=1), freqs)
    ax_power.set(xlabel='average power per Hz', ylim=(freqs[0], freqs[-1]))
    fig.suptitle('continuous wavelet transform normalization test')


def test_sinus():
    # sinus test
    w0 = 8
    fs = 1.0
    times = np.arange(-100, 100, fs)
    npts = len(times)
    dt = times[1] - times[0]

    signal = np.empty(npts)
    signal[times < 0] = np.sin(2 * np.pi * 0.4 * times[times < 0])
    signal[times >= 0] = np.sin(2 * np.pi * 0.1 * times[times >= 0])

    print('sampling rate', fs)
    print('nyquist', fs / 2)

    nfreqs = 100
    freqs = np.linspace(1e-2, fs / 2, nfreqs)

    power = np.abs(continuous_wavelet_transform(signal, freqs, dt, w0))**2
    extent = (times[0], times[-1], freqs[0], freqs[-1])

    fig, (row1, row2) = plt.subplots(2, 1, sharex=True)
    im = row2.imshow(power, origin='lower', extent=extent, aspect='auto')
    cb = plt.colorbar(im)
    cb.set_label('wavelet energy')
    row1.plot(times, signal)
    row1.set(ylabel='signal amplitude')
    row2.set(xlabel='time [s]', ylabel='frequency [Hz]')


def main():
    test_white_noise()
    test_sinus()
    plt.show()


if __name__ == "__main__":
    main()
```

<img src="/images/posts/continuous_wavelet_transform_test.png"/>
