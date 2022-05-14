{
  description = "Website";

  inputs.nixpkgs.url = github:NixOS/nixpkgs/nixos-21.05;
  inputs.npmlock2nixSrc = {
      url = github:nix-community/npmlock2nix;
      flake = false;
      };

  outputs = { self, nixpkgs, npmlock2nixSrc }: (
     let 
        pkgs = nixpkgs.legacyPackages.x86_64-linux;
        npmlock2nix = pkgs.callPackage npmlock2nixSrc {};
        deps = with pkgs; [
              hivemind
              purescript
              spago
              pandoc
              graphviz
              nodePackages.purescript-language-server
              nodePackages.parcel-bundler
              nodePackages.purty
              nodejs
            ];
        shell = npmlock2nix.shell {
          src = ./.;
          buildInputs = deps; 
        };
     in
     {
        devShell.x86_64-linux = shell;
     }
     );
}
