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
        packages = p: with p; [ sympy scipy seaborn matplotlib numpy ];
        ignoreCollisions = true;
      };

      jupyterEnvironment = pkgs.jupyterlabWith {
          kernels = [ iPython ];
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
