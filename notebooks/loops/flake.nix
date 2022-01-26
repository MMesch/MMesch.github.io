{
  description = "JupyterLab Flake";

  inputs = {
      jupyterWith.url = "github:tweag/jupyterWith";
  };

  outputs = { self, nixpkgs, jupyterWith }:
    let
      notebooks = ./.;

      pkgs = import nixpkgs {
        system = "x86_64-linux";
        overlays = nixpkgs.lib.attrValues jupyterWith.overlays;
        config = {
          allowUnfree = true;
        };
      };

      iPython = pkgs.kernels.iPythonWith {
        name = "Python-env";
        ignoreCollisions = true;
      };

      iHaskell = pkgs.kernels.iHaskellWith {
        extraIHaskellFlags = "--codemirror Haskell"; # for jupyterlab syntax highlighting
        name = "ihaskell-flake";
        packages = p: with p; [ ];
      };

      jupyterEnvironment = pkgs.jupyterlabWith {
          kernels = [ iPython iHaskell ];
      };
    in
    {
#      packages.x86_64-linux.jupyterLab = jupyterEnvironment;
#      defaultPackage.x86_64-linux = jupyterEnvironment;
      apps.x86_64-linux.jupterlab = {
          type = "app";
          program = "${jupyterEnvironment}/bin/jupyter-lab";
          };
      defaultApp.x86_64-linux = self.apps.x86_64-linux.jupterlab;
    };
}
