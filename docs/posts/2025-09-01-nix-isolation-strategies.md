---
title: "Isolation methods in Nix"
labels:
  - study
description: |
    Overview of isolation methods in Nix for a home / work config that
    occasionally requires running untrusted code.
---

# Introduction

This article compares options for *compartmentalization* of a Nix-driven
configuration. The main boundaries are a home config, a work config with
sensitive documents, a general dev config, a dev config for untrusted code
including AI agents.

I'm writing this primarily to educate myself. The list of options I explore is

- separate physical machines
- remote VMs
- local VMs
- NixOS containers
- containers
- simple multi user setup with flakes and same config
- simple multi user setup with flakes and separate home config
- NixOS specialisations with separate encrypted disks


# overview


NixOS overview page: https://nixos.wiki/wiki/Security
name spaces: https://lwn.net/Articles/978846/
vms: 
containers: 
bubblewrap: https://github.com/containers/bubblewrap

# Existing articles

# chroot

- changes apparent root director / to specific folders and
  applications cannot name anything that is outside of their
  own directory tree.

# VMs

NixOS includes support for hosting virtual machines. The Nix store of the host machine is shared read-only with guest machines, making them lighter-weight in terms of storage use than typical VMs. Guest VMs are easily built from Nix configurations.

# flatpack and bubblewrap

critique: https://flatkill.org/

# Containers

# NIXOS Containers

https://blog.beardhatcode.be/2020/12/Declarative-Nixos-Containers.html
https://www.reddit.com/r/NixOS/comments/k2l0j0/compartmentalisation_in_nixos/

# spectrumOS

https://www.qubes-os.org/intro/
https://spectrum-os.org/

→ Cloud Hypervisor
→ virtio-gpu

# NixOS specialisations

https://nixos.wiki/wiki/Specialisation
https://www.tweag.io/blog/2022-08-18-nixos-specialisations/
