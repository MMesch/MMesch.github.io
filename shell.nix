{ pkgs ? import <nixpkgs> {} }:

let
  overrides = self: super: {
      hakyll = pkgs.haskell.lib.appendConfigureFlag super.hakyll ["-fpreviewserver"];
    };
  hskPkgs = pkgs.haskell.packages.ghc865.override { overrides = overrides; };
  myenv = hskPkgs.ghcWithPackages (p: [p.hakyll p.hakyll-sass p.hakyll-images]);
in
  pkgs.stdenv.mkDerivation {
    name="hakyll";
    buildInputs = [
      pkgs.inkscape
      pkgs.imagemagick
      myenv
    ];
  }
