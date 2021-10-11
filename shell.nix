{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    hivemind
    purescript
    spago
    nodePackages.purescript-language-server
    nodePackages.parcel-bundler
    nodePackages.purty
    nodejs
  ];
}
