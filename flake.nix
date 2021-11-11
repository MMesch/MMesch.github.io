{
  description = "Purescript shell";

  inputs.nixpkgs.url = github:NixOS/nixpkgs/nixos-21.05;

  outputs = { self, nixpkgs }: {

    defaultPackage.x86_64-linux =
     (let 
        pkgs = nixpkgs.legacyPackages.x86_64-linux;
      in
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
      });
  };
}
