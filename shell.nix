{ pkgs ? import <nixpkgs> {} }:

let
  overrides = self: super: {
      hakyll2 = pkgs.haskell.lib.appendConfigureFlag super.hakyll ["-fpreviewserver"];
    };
  hskPkgs = pkgs.haskell.packages.ghc865.override { overrides = overrides; };
  myenv = hskPkgs.ghcWithPackages (p: [p.hakyll2]);
in
  pkgs.stdenv.mkDerivation {
    name="hakyll";
    buildInputs = [
      myenv
    ];
  }
