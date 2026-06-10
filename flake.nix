{
  description = "Website";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    purescript-overlay = {
      url = "github:thomashoneyman/purescript-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, purescript-overlay }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
        overlays = [ purescript-overlay.overlays.default ];
      };
      deps = with pkgs; [
        entr
        hivemind
        purs
        spago
        purescript-language-server
        nodejs
      ];
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = deps;
        shellHook = ''
          export PATH="$PWD/node_modules/.bin:$PATH"
        '';
      };
    };
}
