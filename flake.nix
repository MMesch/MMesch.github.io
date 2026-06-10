{
  description = "Website";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
      deps = with pkgs; [
        hivemind
        purescript
        spago
        pandoc
        graphviz
        nodejs
      ];
    in
    {
      devShells.x86_64-linux.default = pkgs.mkShell {
        buildInputs = deps;
        shellHook = ''
          export PATH="$PWD/node_modules/.bin:$PATH"
        '';
      };
    };
}
